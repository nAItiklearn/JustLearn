"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserHandle, getOrCreateUserId } from "@/lib/user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { fetchSummaries } from "@/lib/data-service";
import { Summary } from "@/types/database";
import { ArrowUpRight, Lock, Trophy, Sparkles, BookOpen, Camera } from "lucide-react";

export default function ProfilePage() {
  const [handle, setHandle] = useState("");
  const [isSupabase, setIsSupabase] = useState(false);
  const [userSummaries, setUserSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentHandle = getUserHandle();
    setHandle(currentHandle);
    setIsSupabase(isSupabaseConfigured());

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        const currentUserId = getOrCreateUserId();
        const all = await fetchSummaries({ sort: "newest" });
        const mine = all.filter(
          (s) =>
            s.author_id === currentUserId ||
            (currentHandle && s.author_name.toLowerCase() === currentHandle.toLowerCase())
        );
        setUserSummaries(mine);
      } catch (err) {
        console.error("Failed to load user profile syntheses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Compute live user stats
  const postsCount = userSummaries.length;
  const paperNotesCount = userSummaries.filter((s) => Boolean(s.paper_note_image_url)).length;
  const scoredPosts = userSummaries.filter((s) => s.average_score > 0);
  const avgScore =
    scoredPosts.length > 0
      ? scoredPosts.reduce((acc, s) => acc + s.average_score, 0) / scoredPosts.length
      : 0;

  // Points formula: 10 pts per synthesis + 25 pts per paper note + (average_score * 5)
  const totalPoints = Math.round(
    postsCount * 10 + paperNotesCount * 25 + avgScore * 5
  );

  return (
    <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-10 sm:py-16 space-y-8 sm:space-y-10 transition-colors">
      <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-lg space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-white/10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Learner Identity</span>
            </div>

            <div className="flex items-center space-x-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
                @{handle || "learner"}
              </h1>
              <span className="inline-flex items-center space-x-1 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 px-3 py-1 text-xs font-bold text-neutral-700 dark:text-neutral-300">
                <Lock className="h-3 w-3 text-neutral-500" />
                <span>Locked Identity</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal">
              Your name is permanently locked to preserve community review and leaderboard integrity.
            </p>
          </div>

          <Link
            href="/"
            className="group flex items-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-5 py-2.5 text-xs font-bold transition-all self-start sm:self-auto shrink-0 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Roll Topic</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
              <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            </span>
          </Link>
        </div>

        {/* Live Personal Statistics */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Your Performance & Learning Record
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {totalPoints}
              </div>
              <div className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center justify-center space-x-1">
                <Trophy className="h-3 w-3 inline" />
                <span>Points</span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {postsCount}
              </div>
              <div className="mt-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center space-x-1">
                <BookOpen className="h-3 w-3 inline" />
                <span>Syntheses</span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {paperNotesCount}
              </div>
              <div className="mt-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center space-x-1">
                <Camera className="h-3 w-3 inline" />
                <span>Paper Notes</span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800/60 p-5 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                {avgScore > 0 ? avgScore.toFixed(1) : "—"}
              </div>
              <div className="mt-1 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center space-x-1">
                <Sparkles className="h-3 w-3 inline" />
                <span>Avg Rating</span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Syntheses List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
              Your Written Syntheses
            </h2>
            <Link
              href="/community"
              className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Browse Community Feed →
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-neutral-200 dark:border-white/10 p-8 text-center text-xs font-bold text-neutral-500">
              Loading your profile records...
            </div>
          ) : userSummaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-800/40 p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                You haven&apos;t published any syntheses yet.
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal max-w-sm mx-auto">
                Roll the dice on the main page, complete your ten minute paper sprint, and write your first memory synthesis!
              </p>
              <Link
                href="/"
                className="inline-flex items-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 px-5 py-2 text-xs font-bold transition-all shadow-sm"
              >
                <span>Start First Sprint</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userSummaries.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800/80 p-4 sm:p-5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                      {s.topic_title}
                    </h3>
                    <div className="flex items-center space-x-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                      <span>{s.average_score > 0 ? s.average_score.toFixed(1) : "—"}</span>
                      <span className="text-[10px] text-neutral-400">/10 ({s.ratings_count})</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 font-normal">
                    {s.content}
                  </p>
                  {s.paper_note_image_url && (
                    <div className="pt-1">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                        <span>📝</span>
                        <span>Physical Paper Notes Attached</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database & Sync Status */}
        <div className="rounded-2xl border border-emerald-500/30 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Database Connectivity</span>
            </div>
            <div className="text-sm font-bold text-neutral-900 dark:text-white">
              {isSupabase ? "Supabase PostgreSQL Database Connected" : "JustLearn Cloud Database (Active & Synchronized)"}
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-normal">
              Cloud database active. Unique usernames, peer ratings, and syntheses sync seamlessly across all global learners.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto shrink-0 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Cloud Database Active</span>
          </div>
        </div>
      </div>
    </main>
  );
}
