"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { fetchSummaries } from "@/lib/data-service";
import { getUserHandle } from "@/lib/user";
import { ArrowUpRight, Trophy, Sparkles, Medal, Award, Flame } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  handle: string;
  totalPoints: number;
  synthesesCount: number;
  ratingsReceived: number;
  averageScore: number;
  paperNotesCount: number;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"points" | "syntheses" | "rating">("points");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserHandle, setCurrentUserHandle] = useState("");

  useEffect(() => {
    setCurrentUserHandle(getUserHandle());
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const summaries = await fetchSummaries({ sort: "top" });

      // Aggregate stats per author directly from summaries
      const authorMap: Record<
        string,
        {
          handle: string;
          posts: number;
          totalVotes: number;
          sumScores: number;
          scoredPosts: number;
          notesCount: number;
        }
      > = {};

      // Merge real summaries from database / local storage
      for (const s of summaries) {
        const handle = s.author_name || "learner";
        if (!authorMap[handle]) {
          authorMap[handle] = {
            handle,
            posts: 0,
            totalVotes: 0,
            sumScores: 0,
            scoredPosts: 0,
            notesCount: 0,
          };
        }
        authorMap[handle].posts += 1;
        authorMap[handle].totalVotes += s.ratings_count || 0;
        if (s.average_score > 0) {
          authorMap[handle].sumScores += s.average_score;
          authorMap[handle].scoredPosts += 1;
        }
        if (s.paper_note_image_url) {
          authorMap[handle].notesCount += 1;
        }
      }

      // Ensure logged-in learner is visible on leaderboard
      if (currentUserHandle && !authorMap[currentUserHandle]) {
        authorMap[currentUserHandle] = {
          handle: currentUserHandle,
          posts: 0,
          totalVotes: 0,
          sumScores: 0,
          scoredPosts: 0,
          notesCount: 0,
        };
      }

      // Calculate total points
      // Formula: (posts * 50) + (notesCount * 25) + (totalVotes * 10) + Math.round(avgScore * 10)
      const list: LeaderboardUser[] = Object.values(authorMap).map((a) => {
        const avg = a.scoredPosts > 0 ? a.sumScores / a.scoredPosts : 0;
        const totalPoints =
          a.posts * 50 +
          a.notesCount * 25 +
          a.totalVotes * 10 +
          Math.round(avg * 10);

        return {
          rank: 0,
          handle: a.handle,
          totalPoints,
          synthesesCount: a.posts,
          ratingsReceived: a.totalVotes,
          averageScore: Math.round(avg * 10) / 10,
          paperNotesCount: a.notesCount,
        };
      });

      setUsers(list);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedUsers = useMemo(() => {
    let list = [...users];
    if (activeTab === "points") {
      list.sort((a, b) => b.totalPoints - a.totalPoints);
    } else if (activeTab === "syntheses") {
      list.sort((a, b) => b.synthesesCount - a.synthesesCount || b.totalPoints - a.totalPoints);
    } else if (activeTab === "rating") {
      list.sort((a, b) => b.averageScore - a.averageScore || b.ratingsReceived - a.ratingsReceived);
    }
    return list.map((u, idx) => ({ ...u, rank: idx + 1 }));
  }, [users, activeTab]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 lg:px-10 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-white/10">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-700 dark:text-amber-400 font-semibold flex items-center space-x-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span>Community Hall of Fame</span>
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-light text-neutral-900 dark:text-white tracking-[-0.03em]">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm sm:text-base font-light text-neutral-500 dark:text-neutral-400">
            Ranked by cognitive synthesis points. The more you explore, post from memory, and earn peer marks, the higher you climb.
          </p>
        </div>

        <Link
          href="/"
          className="group flex items-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-5 py-2.5 text-xs font-medium transition-all shadow-sm self-start sm:self-auto shrink-0"
        >
          <span>Roll Topic & Climb</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
          </span>
        </Link>
      </div>

      {/* Point Rules Card */}
      <div className="rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-5 sm:p-6 text-xs text-neutral-700 dark:text-neutral-300">
        <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Point Breakdown</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
          <div className="bg-white/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-white/10">
            <span className="text-amber-700 dark:text-amber-400 font-bold">+50 pts</span> per Published Synthesis
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-white/10">
            <span className="text-amber-700 dark:text-amber-400 font-bold">+25 pts</span> per Paper Notes Photo
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-white/10">
            <span className="text-amber-700 dark:text-amber-400 font-bold">+10 pts</span> per Peer Vote Received
          </div>
          <div className="bg-white/80 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-amber-200 dark:border-white/10">
            <span className="text-amber-700 dark:text-amber-400 font-bold">1–100 pts</span> Clarity Rating Bonus
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-6 text-sm border-b border-neutral-200 dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab("points")}
          className={`pb-1 transition-colors cursor-pointer ${
            activeTab === "points"
              ? "text-neutral-900 dark:text-white font-semibold border-b-2 border-amber-500"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-light"
          }`}
        >
          Top Overall Points
        </button>
        <button
          onClick={() => setActiveTab("syntheses")}
          className={`pb-1 transition-colors cursor-pointer ${
            activeTab === "syntheses"
              ? "text-neutral-900 dark:text-white font-semibold border-b-2 border-amber-500"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-light"
          }`}
        >
          Most Syntheses
        </button>
        <button
          onClick={() => setActiveTab("rating")}
          className={`pb-1 transition-colors cursor-pointer ${
            activeTab === "rating"
              ? "text-neutral-900 dark:text-white font-semibold border-b-2 border-amber-500"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-light"
          }`}
        >
          Highest Clarity Rating
        </button>
      </div>

      {/* Podium Top 3 (on Desktop) */}
      {!isLoading && sortedUsers.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Rank */}
          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 p-6 text-center order-2 md:order-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 font-bold text-xs mb-3">
                #2
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                @{sortedUsers[1].handle}
              </h3>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                {sortedUsers[1].totalPoints} <span className="text-xs text-neutral-500 font-bold">pts</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex justify-around">
              <span>{sortedUsers[1].synthesesCount} posts</span>
              <span>•</span>
              <span>{sortedUsers[1].averageScore}/10 avg</span>
            </div>
          </div>

          {/* #1 Rank (Crown / Gold) */}
          <div className="rounded-3xl border-2 border-amber-400 dark:border-amber-400/80 bg-gradient-to-b from-amber-50/90 to-white dark:from-amber-950/40 dark:to-neutral-900/95 p-7 text-center order-1 md:order-2 shadow-lg shadow-amber-500/10 flex flex-col justify-between scale-102">
            <div>
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-amber-400 text-neutral-950 font-bold text-sm mb-3 shadow-sm">
                #1
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                @{sortedUsers[0].handle}
              </h3>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white mt-2">
                {sortedUsers[0].totalPoints} <span className="text-xs text-amber-700 dark:text-amber-400 font-bold">pts</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-200 dark:border-white/10 text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex justify-around">
              <span>{sortedUsers[0].synthesesCount} posts</span>
              <span>•</span>
              <span>{sortedUsers[0].averageScore}/10 avg</span>
              <span>•</span>
              <span>📸 {sortedUsers[0].paperNotesCount}</span>
            </div>
          </div>

          {/* #3 Rank */}
          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 p-6 text-center order-3 md:order-3 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 dark:bg-neutral-800 text-amber-900 dark:text-amber-400 font-bold text-xs mb-3">
                #3
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                @{sortedUsers[2].handle}
              </h3>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-2">
                {sortedUsers[2].totalPoints} <span className="text-xs text-neutral-500 font-bold">pts</span>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/10 text-xs font-semibold text-neutral-600 dark:text-neutral-400 flex justify-around">
              <span>{sortedUsers[2].synthesesCount} posts</span>
              <span>•</span>
              <span>{sortedUsers[2].averageScore}/10 avg</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[11px]">
                <th className="py-4 px-4 sm:px-6">Rank</th>
                <th className="py-4 px-4 sm:px-6">Learner</th>
                <th className="py-4 px-4 sm:px-6 text-right">Points</th>
                <th className="py-4 px-4 sm:px-6 text-right hidden sm:table-cell">Syntheses</th>
                <th className="py-4 px-4 sm:px-6 text-right hidden sm:table-cell">Peer Votes</th>
                <th className="py-4 px-4 sm:px-6 text-right">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-white/5 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-500 font-bold">
                    Calculating leaderboard standings...
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const isCurrent = currentUserHandle && user.handle === currentUserHandle;
                  return (
                    <tr
                      key={user.handle}
                      className={`transition-colors ${
                        isCurrent
                          ? "bg-amber-50/70 dark:bg-amber-950/20 font-bold"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-bold text-neutral-700 dark:text-neutral-300">
                        {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-neutral-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">@{user.handle}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-400 text-neutral-950 px-2 py-0.5 rounded-full font-bold">
                              You
                            </span>
                          )}
                          {user.paperNotesCount > 0 && (
                            <span className="text-[11px] text-neutral-500 font-bold" title={`${user.paperNotesCount} physical notes uploaded`}>
                              📝 {user.paperNotesCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-neutral-900 dark:text-white">
                        {user.totalPoints}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">
                        {user.synthesesCount}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-semibold text-neutral-700 dark:text-neutral-300 hidden sm:table-cell">
                        {user.ratingsReceived}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-amber-700 dark:text-amber-400">
                        {user.averageScore > 0 ? user.averageScore.toFixed(1) : "—"}/10
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
