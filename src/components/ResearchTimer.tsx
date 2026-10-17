"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { playTimerCompletionChime } from "@/lib/chime";
import { Play, Pause, RotateCcw, Plus, Clock } from "lucide-react";

interface ResearchTimerProps {
  topicId: string;
  topicTitle: string;
  durationMinutes?: number;
  soundEnabled: boolean;
  onTimerComplete: () => void;
  isUnlocked: boolean;
}

interface StoredTimerState {
  topicId: string;
  deadline: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  pausedRemaining: number | null;
  completed: boolean;
}

export function ResearchTimer({
  topicId,
  topicTitle,
  durationMinutes = 10,
  soundEnabled,
  onTimerComplete,
  isUnlocked,
}: ResearchTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const storageKey = `justlearn_timer_${topicId}`;

  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const [isActive, setIsActive] = useState<boolean>(!isUnlocked);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const completedOnceRef = useRef<boolean>(isUnlocked);
  const deadlineRef = useRef<number>(Date.now() + totalSeconds * 1000);
  const originalTitleRef = useRef<string>("");

  const saveState = useCallback((state: Partial<StoredTimerState>) => {
    if (typeof window === "undefined") return;
    try {
      const prevRaw = localStorage.getItem(storageKey);
      const prev: Partial<StoredTimerState> = prevRaw ? JSON.parse(prevRaw) : {};
      const merged = { ...prev, ...state, topicId };
      localStorage.setItem(storageKey, JSON.stringify(merged));
    } catch {}
  }, [storageKey, topicId]);

  const handleCompletion = useCallback(() => {
    if (completedOnceRef.current) return;
    completedOnceRef.current = true;

    setIsActive(false);
    setIsPaused(false);
    setSecondsRemaining(0);
    saveState({ completed: true, isPaused: false, pausedRemaining: 0 });

    if (soundEnabled) {
      playTimerCompletionChime();
    }

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    onTimerComplete();
  }, [onTimerComplete, saveState, soundEnabled]);

  // Restore stored deadline or initialize on mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      originalTitleRef.current = document.title || "JustLearn";
    }

    if (isUnlocked) {
      completedOnceRef.current = true;
      setSecondsRemaining(0);
      setIsActive(false);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const stored: StoredTimerState = JSON.parse(raw);
        if (stored.completed) {
          completedOnceRef.current = true;
          setSecondsRemaining(0);
          setIsActive(false);
          onTimerComplete();
          return;
        }

        if (stored.isPaused && stored.pausedRemaining !== null) {
          setIsPaused(true);
          setSecondsRemaining(stored.pausedRemaining);
          deadlineRef.current = Date.now() + stored.pausedRemaining * 1000;
          return;
        }

        if (stored.deadline) {
          const remaining = Math.max(0, Math.ceil((stored.deadline - Date.now()) / 1000));
          if (remaining <= 0) {
            handleCompletion();
            return;
          }
          deadlineRef.current = stored.deadline;
          setSecondsRemaining(remaining);
          return;
        }
      }
    } catch {}

    // Fresh initialization
    const newDeadline = Date.now() + totalSeconds * 1000;
    deadlineRef.current = newDeadline;
    setSecondsRemaining(totalSeconds);
    saveState({
      deadline: newDeadline,
      totalDurationSeconds: totalSeconds,
      isPaused: false,
      pausedRemaining: null,
      completed: false,
    });
  }, [handleCompletion, isUnlocked, onTimerComplete, saveState, storageKey, totalSeconds]);

  // Recalculate precisely on tab visibility change or laptop wake-from-sleep
  useEffect(() => {
    const handleSync = () => {
      if (completedOnceRef.current || isPaused || !isActive) return;
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        handleCompletion();
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
    };
  }, [handleCompletion, isActive, isPaused]);

  // Regular interval tick based on stored deadline
  useEffect(() => {
    if (!isActive || isPaused || completedOnceRef.current) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
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
  }, [handleCompletion, isActive, isPaused, topicTitle]);

  const pauseTimer = () => {
    setIsPaused(true);
    saveState({ isPaused: true, pausedRemaining: secondsRemaining });
  };

  const resumeTimer = () => {
    const newDeadline = Date.now() + secondsRemaining * 1000;
    deadlineRef.current = newDeadline;
    setIsPaused(false);
    saveState({ isPaused: false, deadline: newDeadline, pausedRemaining: null });
  };

  const resetTimer = () => {
    completedOnceRef.current = false;
    const newDeadline = Date.now() + totalSeconds * 1000;
    deadlineRef.current = newDeadline;
    setSecondsRemaining(totalSeconds);
    setIsActive(true);
    setIsPaused(false);
    saveState({
      deadline: newDeadline,
      totalDurationSeconds: totalSeconds,
      isPaused: false,
      pausedRemaining: null,
      completed: false,
    });
  };

  const addExtraMinutes = (extraMin: number) => {
    const extraSec = extraMin * 60;
    const nextRemaining = secondsRemaining + extraSec;
    const nextDeadline = (isPaused ? Date.now() : deadlineRef.current) + extraSec * 1000;
    deadlineRef.current = nextDeadline;
    setSecondsRemaining(nextRemaining);
    saveState({
      deadline: nextDeadline,
      pausedRemaining: isPaused ? nextRemaining : null,
      completed: false,
    });
    if (completedOnceRef.current) {
      completedOnceRef.current = false;
      setIsActive(true);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - secondsRemaining) / totalSeconds) * 100));

  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-xl transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400 font-semibold">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Offline Focus Countdown ({durationMinutes} Min Sprint)</span>
          </div>
          <div className="mt-2 text-5xl sm:text-7xl font-[200] tracking-tight text-neutral-900 dark:text-white font-mono">
            {timeFormatted}
          </div>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-light text-neutral-600 dark:text-neutral-400 max-w-md">
            Grab physical paper. Take handwritten notes offline. Looking at no screens, synthesize from memory when 00:00 hits.
          </p>
        </div>

        {/* Action Controls & Policy */}
        <div className="flex flex-wrap sm:flex-col sm:items-end gap-2.5 shrink-0 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            {isActive && !isPaused && secondsRemaining > 0 && (
              <button
                type="button"
                onClick={pauseTimer}
                className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer"
              >
                <Pause className="h-3 w-3" />
                <span>Pause</span>
              </button>
            )}

            {isPaused && secondsRemaining > 0 && (
              <button
                type="button"
                onClick={resumeTimer}
                className="flex items-center space-x-1.5 rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 px-3.5 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-300 transition-all cursor-pointer"
              >
                <Play className="h-3 w-3" />
                <span>Resume</span>
              </button>
            )}

            <button
              type="button"
              onClick={resetTimer}
              className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="Restart full sprint timer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={() => addExtraMinutes(2)}
              className="flex items-center space-x-1 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
              title="Add 2 minutes to research"
            >
              <Plus className="h-3 w-3" />
              <span>2m</span>
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
