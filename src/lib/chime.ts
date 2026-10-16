// Synthesizes a calming two-tone bell chime using the Web Audio API

export function playTimerCompletionChime(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic bell frequencies (e.g. E5 and B5)
    const notes = [
      { freq: 659.25, time: 0.0, duration: 2.5 },
      { freq: 987.77, time: 0.25, duration: 3.0 },
      { freq: 1318.51, time: 0.5, duration: 2.2 },
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      // Bell envelope: rapid attack, smooth exponential decay
      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.3, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (err) {
    console.warn("Web Audio API chime could not play:", err);
  }
}
