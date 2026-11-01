"use client";

import { useEffect, useState } from "react";

export function RenewalLive() {
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState(0); // 0 waiting · 1 sliding in · 2 chip turned

  useEffect(() => {
    setReady(true);
    const cycle = setInterval(() => {
      setPhase((p) => (p + 1) % 3);
    }, 2200);
    return () => clearInterval(cycle);
  }, []);

  if (!ready) return <div className="card h-[190px] animate-pulse" style={{ background: "var(--card)" }} />;

  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="px-5 pt-4 pb-3 border-b hairline flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Your shelf</div>
          <div className="text-[15px] font-medium">renewals</div>
        </div>
        <span className="text-[11.5px] text-[var(--ink-faint)]">simulated in your browser</span>
      </div>
      <div className="px-5 py-4 space-y-2 min-h-[128px]">
        <div className="flex items-center gap-3 py-2">
          <span className="w-9 h-9 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0" style={{ background: "#b1060f" }}>N</span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium truncate">Netflix</div>
            <div className="text-[12px] text-[var(--ink-faint)]">₹649 · monthly</div>
          </div>
          <span className="text-[12px] text-[var(--ink-soft)] tabular-nums shrink-0">in 6 days</span>
          <span className="text-[12px] font-medium px-2 py-0.5 rounded-full tone-this-month shrink-0">in 6 days</span>
        </div>

        {phase >= 1 && (
          <div className="flex items-center gap-3 py-2 perch-in">
            <span className="w-9 h-9 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0" style={{ background: "#2b6a4c" }}>R</span>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium truncate">Railway</div>
              <div className="text-[12px] text-[var(--ink-faint)]">new receipt · just now</div>
            </div>
            <span className="text-[12px] text-[var(--ink-soft)] tabular-nums shrink-0">in 2 days</span>
            <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full shrink-0 ${phase >= 2 ? "tone-now" : "tone-pending"}`}>
              {phase >= 2 ? "in 2 days" : "pending"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
