"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserHandle, saveUserHandle, getOrCreateUserId } from "@/lib/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ArrowUpRight, Check, Edit2 } from "lucide-react";

export default function ProfilePage() {
  const [handle, setHandle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempHandle, setTempHandle] = useState("");
  const [isSupabase, setIsSupabase] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setHandle(getUserHandle());
    setIsSupabase(isSupabaseConfigured());
    setUserId(getOrCreateUserId());
  }, []);

  const handleSave = () => {
    if (tempHandle.trim()) {
      saveUserHandle(tempHandle.trim());
      setHandle(tempHandle.trim());
    }
    setIsEditing(false);
  };

  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10">
      <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-12 shadow-xl space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-100 dark:border-white/10">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-700 dark:text-amber-400 font-semibold">
              Learner Identity
            </span>

            {isEditing ? (
              <div className="mt-2 flex items-center space-x-2">
                <input
                  type="text"
                  value={tempHandle}
                  onChange={(e) => setTempHandle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="rounded-xl border border-neutral-300 dark:border-white/20 bg-neutral-50 dark:bg-neutral-800 px-3.5 py-1.5 text-base sm:text-lg font-light text-neutral-900 dark:text-white focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1 rounded-xl bg-neutral-900 dark:bg-white px-3.5 py-2 text-xs font-medium text-white dark:text-neutral-950 hover:bg-black cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save</span>
                </button>
              </div>
            ) : (
              <div className="mt-2 flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-light text-neutral-900 dark:text-white tracking-tight">
                  @{handle || "learner"}
                </h1>
                <button
                  onClick={() => {
                    setTempHandle(handle);
                    setIsEditing(true);
                  }}
                  className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Edit handle"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <p className="mt-1 text-xs font-light text-neutral-400 dark:text-neutral-500 font-mono">
              Anonymous Session ID: {userId.slice(0, 16)}...
            </p>
          </div>

          <Link
            href="/"
            className="group flex items-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-5 py-2.5 text-xs font-medium transition-all self-start sm:self-auto shrink-0 shadow-sm"
          >
            <span>Roll Rabbit Hole</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            </span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
            <div className="text-3xl font-[200] text-neutral-900 dark:text-white font-mono">10:00</div>
            <div className="mt-1 text-xs font-light text-neutral-500 dark:text-neutral-400">Focus Target</div>
          </div>
          <div className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
            <div className="text-3xl font-[200] text-neutral-900 dark:text-white font-mono">32</div>
            <div className="mt-1 text-xs font-light text-neutral-500 dark:text-neutral-400">Curated Topics</div>
          </div>
          <div className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
            <div className="text-3xl font-[200] text-neutral-900 dark:text-white font-mono">1–10</div>
            <div className="mt-1 text-xs font-light text-neutral-500 dark:text-neutral-400">Peer Scoring</div>
          </div>
        </div>

        {/* Database Status Indicator */}
        <div className="rounded-2xl border border-neutral-100 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Database Sync
            </div>
            <div className="text-sm font-medium text-neutral-900 dark:text-white">
              {isSupabase ? "Supabase Cloud Database Connected" : "Local Browser Session (Zero-Config Active)"}
            </div>
            <p className="text-xs font-light text-neutral-500 dark:text-neutral-400">
              {isSupabase
                ? "Your summaries and ratings persist globally across all community members in PostgreSQL."
                : "All 32 seed topics and ratings work immediately offline. Add NEXT_PUBLIC_SUPABASE_URL in Vercel to sync globally."}
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-medium self-start sm:self-auto shrink-0 ${
              isSupabase
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
            }`}
          >
            {isSupabase ? "Supabase Active" : "Local Session Ready"}
          </div>
        </div>
      </div>
    </main>
  );
}
