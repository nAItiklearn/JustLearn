"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { playTimerCompletionChime } from "@/lib/chime";
import { Play, Pause, RotateCcw, ArrowRight } from "lucide-react";

const TOTAL_DURATION_SECONDS = 10 * 60; // 10 minutes

interface ResearchTimerProps {
  topicId: string;
  topicTitle: string;
  soundEnabled: boolean;
  onTimerComplete: () => void;
  isUnlocked: boolean;
}

export function ResearchTimer({
  topicTitle,
  soundEnabled,
  onTimerComplete,
  isUnlocked,
}: ResearchTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(TOTAL_DURATION_SECONDS);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const endTimeRef = useRef<number>(Date.now() + TOTAL_DURATION_SECONDS * 1000);
  const originalTitleRef = useRef<string>("");

  useEffect(() => {
    if (typeof document !== "undefined") {
      originalTitleRef.current = document.title || "JustLearn";
    }
  }, []);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const formatted = `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}] ${topicTitle}`;
      if (typeof document !== "undefined") {
        document.title = formatted;
      }

      if (remaining <= 0) {
        clearInterval(interval);
        handleCompletion();
      }
    }, 250);

    return () => {
      clearInterval(interval);
      if (typeof document !== "undefined" && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [isActive, isPaused, topicTitle]);

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    endTimeRef.current = Date.now() + secondsRemaining * 1000;
    setIsPaused(false);
  };

  const resetTimer = () => {
    endTimeRef.current = Date.now() + TOTAL_DURATION_SECONDS * 1000;
    setSecondsRemaining(TOTAL_DURATION_SECONDS);
    setIsActive(true);
    setIsPaused(false);
  };

  const handleCompletion = () => {
    setIsActive(false);
    setIsPaused(false);
    setSecondsRemaining(0);

    if (soundEnabled) {
      playTimerCompletionChime();
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    onTimerComplete();
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.min(100, Math.max(0, ((TOTAL_DURATION_SECONDS - secondsRemaining) / TOTAL_DURATION_SECONDS) * 100));

  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-xl transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 font-semibold">
            Offline Focus Countdown
          </div>
          <div className="mt-2 text-5xl sm:text-7xl font-[200] tracking-tight text-neutral-900 dark:text-white font-mono">
            {timeFormatted}
          </div>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-light text-neutral-500 dark:text-neutral-400 max-w-md">
            Grab a physical notebook and pen. Take key points on paper. The writing box unlocks automatically at 00:00.
          </p>
        </div>

        {/* Action Controls & Dev Skip */}
        <div className="flex flex-wrap sm:flex-col sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            {isActive && !isPaused && (
              <button
                onClick={pauseTimer}
                className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
              >
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </button>
            )}

            {isPaused && (
              <button
                onClick={resumeTimer}
                className="flex items-center space-x-1.5 rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-3.5 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-300 transition-all cursor-pointer"
              >
                <Play className="h-3 w-3" />
                <span>Resume</span>
              </button>
            )}

            <button
              onClick={resetTimer}
              className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 sm:mt-8 w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-amber-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
