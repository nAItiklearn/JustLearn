"use client";

import React, { useState, useEffect } from "react";
import { isNameLocked, lockUserName } from "@/lib/user";
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function NameLockModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
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

  // Debounced real-time availability check
  useEffect(() => {
    const clean = name.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");
    if (clean.length < 2) {
      setIsAvailable(null);
      return;
    }

    setCheckingAvailability(true);
    setError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users?check=${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          setIsAvailable(data.isAvailable);
          if (!data.isAvailable) {
            setError(`@${clean} is already claimed by another learner. Please choose a unique name.`);
          }
        }
      } catch {
        setIsAvailable(true);
      } finally {
        setCheckingAvailability(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = name.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "");

    if (clean.length < 2) {
      setError("Please enter a name with at least 2 characters.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: clean }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || `@${clean} is already taken. Please choose a unique name.`);
        setIsAvailable(false);
        setIsSubmitting(false);
        return;
      }

      lockUserName(data.username || clean);
      setIsOpen(false);
    } catch {
      // Fallback
      lockUserName(clean);
      setIsOpen(false);
    } finally {
      setIsSubmitting(false);
    }
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
            Please enter your unique name to begin. Every learner must have a distinct, non-duplicate identity that permanently locks to this device.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                Your Name / Handle:
              </label>
              {checkingAvailability && (
                <span className="text-[11px] text-neutral-400 flex items-center space-x-1 font-medium">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Checking availability...</span>
                </span>
              )}
              {!checkingAvailability && isAvailable === true && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 font-bold">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Available</span>
                </span>
              )}
            </div>

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
                className={`w-full rounded-2xl border bg-neutral-50 dark:bg-neutral-800 pl-8 pr-4 py-3 text-sm font-bold text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-all ${
                  error
                    ? "border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : isAvailable === true
                    ? "border-emerald-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    : "border-neutral-300 dark:border-white/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                }`}
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-500 flex items-center space-x-1 pt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 p-3 text-[11px] text-amber-900 dark:text-amber-300 flex items-start space-x-2">
            <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Note:</strong> Names are globally unique. Once locked, this name cannot be claimed by anyone else or edited later.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isAvailable === false}
            className="w-full group flex items-center justify-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 py-3.5 text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Registering Unique Identity...</span>
              </>
            ) : (
              <>
                <span>Lock Name & Enter JustLearn</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
