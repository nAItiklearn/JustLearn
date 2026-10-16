"use client";

import React, { useState, useEffect } from "react";
import { isNameLocked, lockUserName } from "@/lib/user";
import { Lock, ArrowRight } from "lucide-react";

export function NameLockModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isNameLocked()) {
      setIsOpen(true);
    }

    const handleLocked = () => {
      setIsOpen(false);
    };

    window.addEventListener("justlearn_name_locked", handleLocked);
    return () => {
      window.removeEventListener("justlearn_name_locked", handleLocked);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");

    if (clean.length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    lockUserName(clean);
    setIsOpen(false);
  };

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-2xl text-left space-y-6">
        {/* Top Badge */}
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Permanent Learner Identity</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Welcome to JustLearn
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-normal leading-relaxed">
            Please enter your name to continue. To ensure authenticity on the leaderboard and peer reviews, your name is entered once and permanently locked.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Your Name / Handle:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">
                @
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. RichardFeynman"
                maxLength={24}
                autoFocus
                className="w-full rounded-2xl border border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-neutral-800 pl-8 pr-4 py-3 text-sm font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-rose-500 pt-1">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 p-3 text-[11px] text-amber-900 dark:text-amber-300 flex items-start space-x-2">
            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Note:</strong> Once locked, this name cannot be changed or edited later.
            </span>
          </div>

          <button
            type="submit"
            className="w-full group flex items-center justify-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 py-3.5 text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Lock Name & Enter JustLearn</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
