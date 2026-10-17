"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Summary, FeedbackItem } from "@/types/database";
import { fetchSummaries, submitRating } from "@/lib/data-service";
import { getOrCreateUserId } from "@/lib/user";
import { RatingBar } from "@/components/RatingBar";
import { ArrowUpRight, Search, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from "lucide-react";

const CATEGORIES = [
  "All",
  "Psychology & Human Behavior",
  "Tech & Computer Science",
  "Science, Biology & Nature",
  "Economics & Game Theory",
  "History & Design Mysteries",
];

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return "yesterday";
    if (diffDay < 30) return `${diffDay}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "recently";
  }
}

export default function CommunityPage() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeTab, setActiveTab] = useState<"top" | "newest">("top");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [feedbackAlert, setFeedbackAlert] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(getOrCreateUserId());
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSummaries({ sort: "top" });
      setSummaries(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleComments = (id: string) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRate = async (
    summaryId: string,
    score: number,
    options?: {
      accuracy: number;
      clarity: number;
      completeness: number;
      comment?: string;
      isCorrection?: boolean;
    }
  ) => {
    setFeedbackAlert(null);
    try {
      const res = await submitRating({
        summaryId,
        score,
        accuracy: options?.accuracy,
        clarity: options?.clarity,
        completeness: options?.completeness,
        comment: options?.comment,
        isCorrection: options?.isCorrection,
      });

      // Reload fresh data to sync feedback items & voters globally
      await loadData();
      setFeedbackAlert("Review submitted successfully! Thank you for constructive peer grading.");
      setTimeout(() => setFeedbackAlert(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit rating";
      setFeedbackAlert(msg);
      setTimeout(() => setFeedbackAlert(null), 5000);
    }
  };

  const filteredSummaries = useMemo(() => {
    let list = [...summaries];

    if (selectedCategory !== "All") {
      list = list.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.topic_title.toLowerCase().includes(q) ||
          s.author_name.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q)
      );
    }

    if (activeTab === "top") {
      list.sort((a, b) => {
        if (b.average_score !== a.average_score) {
          return b.average_score - a.average_score;
        }
        return b.ratings_count - a.ratings_count;
      });
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [summaries, activeTab, selectedCategory, searchQuery]);

  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 lg:px-10 py-8 sm:py-12 space-y-8 sm:space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 sm:pb-8 border-b border-neutral-200 dark:border-white/10">
        <div>
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-amber-700 dark:text-amber-400 font-semibold">
            Community Peer Evaluation
          </span>
          <h1 className="mt-2 text-3xl sm:text-5xl font-light text-neutral-900 dark:text-white tracking-[-0.03em]">
            Memory Syntheses
          </h1>
          <p className="mt-2 text-sm sm:text-base font-light text-neutral-500 dark:text-neutral-400">
            Read summaries written from memory after 10 minutes of offline paper research. Award marks from 1 to 10.
          </p>
        </div>

        <Link
          href="/"
          className="group flex items-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-5 py-2.5 text-xs font-medium transition-all shadow-sm self-start sm:self-auto shrink-0"
        >
          <span>Start a Dive</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-neutral-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
          </span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center space-x-6 text-sm">
            <button
              onClick={() => setActiveTab("top")}
              className={`pb-1 transition-colors cursor-pointer ${
                activeTab === "top"
                  ? "text-neutral-900 dark:text-white font-semibold border-b-2 border-amber-500"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-light"
              }`}
            >
              Top Rated
            </button>
            <button
              onClick={() => setActiveTab("newest")}
              className={`pb-1 transition-colors cursor-pointer ${
                activeTab === "newest"
                  ? "text-neutral-900 dark:text-white font-semibold border-b-2 border-amber-500"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-light"
              }`}
            >
              Newest
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syntheses or authors..."
              className="w-full rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 pl-9 pr-4 py-2 text-xs font-light text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const shortName = cat === "All" ? "All Niches" : cat.split(" ")[0];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-medium"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-white/10 font-light"
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Alert Notice */}
      {feedbackAlert && (
        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{feedbackAlert}</span>
          </div>
          <button
            onClick={() => setFeedbackAlert(null)}
            className="text-amber-800 dark:text-amber-400 hover:underline font-bold text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Cards List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-xs font-light text-neutral-400 space-y-2">
            <span>Loading community syntheses...</span>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900 p-12 text-center shadow-sm">
            <p className="text-sm font-light text-neutral-500 dark:text-neutral-400">
              No syntheses found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          filteredSummaries.map((summary) => (
            <div
              key={summary.id}
              className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-8 shadow-md hover:shadow-lg transition-all space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-white tracking-tight">
                    {summary.topic_title}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2 text-xs font-light text-neutral-400 dark:text-neutral-500">
                    <span className="text-neutral-700 dark:text-neutral-300 font-medium">@{summary.author_name}</span>
                    <span>•</span>
                    <span>{formatRelativeTime(summary.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 rounded-full border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs text-amber-900 dark:text-amber-300">
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {summary.average_score > 0 ? summary.average_score.toFixed(1) : "—"}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-semibold">/10 ({summary.ratings_count})</span>
                </div>
              </div>

              {/* 3 Criteria Metrics Breakdown */}
              {(summary.accuracy_avg || summary.average_score > 0) && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-white/10">
                    Accuracy: <strong className="text-neutral-900 dark:text-white">{summary.accuracy_avg || summary.average_score}</strong>
                  </span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-white/10">
                    Clarity: <strong className="text-neutral-900 dark:text-white">{summary.clarity_avg || summary.average_score}</strong>
                  </span>
                  <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-white/10">
                    Completeness: <strong className="text-neutral-900 dark:text-white">{summary.completeness_avg || summary.average_score}</strong>
                  </span>
                </div>
              )}

              <p className="text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300 font-light whitespace-pre-line">
                {summary.content}
              </p>

              {/* Physical Paper Note Attachment Image Preview */}
              {summary.paper_note_image_url && (
                <div className="pt-2">
                  <div
                    onClick={() => setSelectedImage(summary.paper_note_image_url || null)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-neutral-800 transition-all hover:border-amber-400 max-w-md"
                  >
                    <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-neutral-900">
                      <img
                        src={summary.paper_note_image_url}
                        alt="Physical paper research notes"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between rounded-xl bg-black/75 px-3 py-1.5 backdrop-blur-md text-[11px] text-white">
                      <span className="flex items-center space-x-1.5 font-medium">
                        <span>📝</span>
                        <span>Physical Paper / Journal Notes</span>
                      </span>
                      <span className="text-amber-300 font-mono text-[10px]">Click to inspect ↗</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expandable Constructive Critiques & Factual Corrections */}
              {summary.feedback_items && summary.feedback_items.length > 0 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => toggleComments(summary.id)}
                    className="flex items-center space-x-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                    <span>
                      {summary.feedback_items.length} Peer Critique{summary.feedback_items.length > 1 ? "s" : ""} & Correction{summary.feedback_items.length > 1 ? "s" : ""}
                    </span>
                    {expandedComments[summary.id] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {expandedComments[summary.id] && (
                    <div className="mt-3 space-y-2.5 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-800/40 p-4 animate-in fade-in duration-200">
                      {summary.feedback_items.map((fb) => (
                        <div key={fb.id} className="border-b border-neutral-200/60 dark:border-white/10 pb-2.5 last:border-b-0 last:pb-0 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-semibold text-neutral-800 dark:text-neutral-200">@{fb.voter_name}</span>
                              <span className="text-neutral-400">•</span>
                              <span className="text-neutral-400 font-mono">{formatRelativeTime(fb.created_at)}</span>
                              {fb.is_correction && (
                                <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-500/30">
                                  <AlertTriangle className="h-2.5 w-2.5 text-amber-600" />
                                  <span>Factual Correction</span>
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                              {fb.overall} / 10
                            </span>
                          </div>
                          {fb.comment && (
                            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-light leading-relaxed">
                              {fb.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-neutral-100 dark:border-white/10">
                <RatingBar
                  summaryId={summary.id}
                  authorId={summary.author_id}
                  currentUserId={currentUserId}
                  userRating={summary.user_rating}
                  userFeedback={summary.user_feedback}
                  onRate={(score, opts) => handleRate(summary.id, score, opts)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal for Full-Size Paper Notes */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full max-h-[90vh] rounded-3xl overflow-hidden bg-neutral-900 border border-white/20 p-2 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-3 text-xs text-neutral-300 font-mono">
              <span>Physical Paper Notes</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="rounded-full bg-white/10 hover:bg-white/20 px-3 py-1 text-xs text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center p-2">
              <img
                src={selectedImage}
                alt="Physical Paper Note"
                className="rounded-xl max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
