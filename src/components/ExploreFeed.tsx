"use client";

import React, { useState, useMemo } from "react";
import { Summary } from "@/types/database";
import { RatingBar } from "@/components/RatingBar";
import { 
  Flame, 
  Sparkles, 
  Clock, 
  Search, 
  Filter, 
  BookOpen, 
  User, 
  Star, 
  Image as ImageIcon,
  ExternalLink,
  MessageSquare,
  Compass
} from "lucide-react";

interface ExploreFeedProps {
  summaries: Summary[];
  currentTopicId: string;
  currentUserId: string;
  onRateSummary: (summaryId: string, score: number) => Promise<void>;
  onSelectTopic?: (topicId: string) => void;
  isLoading?: boolean;
}

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

export function ExploreFeed({
  summaries,
  currentTopicId,
  currentUserId,
  onRateSummary,
  onSelectTopic,
  isLoading = false,
}: ExploreFeedProps) {
  const [activeTab, setActiveTab] = useState<"top" | "newest" | "current">("top");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter & sort summaries
  const filteredSummaries = useMemo(() => {
    let list = [...summaries];

    // Current Topic filter
    if (activeTab === "current") {
      list = list.filter((s) => s.topic_id === currentTopicId);
    }

    // Category filter
    if (selectedCategory !== "All") {
      list = list.filter((s) => s.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.topic_title.toLowerCase().includes(q) ||
          s.author_name.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (activeTab === "top") {
      list.sort((a, b) => {
        if (b.average_score !== a.average_score) {
          return b.average_score - a.average_score;
        }
        return b.ratings_count - a.ratings_count;
      });
    } else if (activeTab === "newest") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [summaries, activeTab, selectedCategory, searchQuery, currentTopicId]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Feed Header */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Compass className="h-4 w-4" />
            </div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Explore Community Feed
            </h2>
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-xs font-mono text-neutral-400">
              {summaries.length} syntheses
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-1 text-xs">
            <button
              onClick={() => setActiveTab("top")}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 transition-all ${
                activeTab === "top"
                  ? "bg-sky-500 text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Top Rated</span>
            </button>
            <button
              onClick={() => setActiveTab("newest")}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 transition-all ${
                activeTab === "newest"
                  ? "bg-sky-500 text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Newest</span>
            </button>
            <button
              onClick={() => setActiveTab("current")}
              className={`flex items-center space-x-1 rounded-lg px-2.5 py-1 transition-all ${
                activeTab === "current"
                  ? "bg-sky-500 text-black font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>This Topic</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search syntheses, topics, or authors..."
            className="w-full rounded-xl bg-black/30 border border-white/10 pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:border-sky-500/50 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="mt-2.5 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const shortName = cat === "All" ? "All Niches" : cat.split(" ")[0];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-2.5 py-1 font-medium transition-all ${
                  isSelected
                    ? "bg-white/20 text-white border border-white/30"
                    : "bg-white/5 text-neutral-400 hover:text-neutral-200 border border-white/5"
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summaries List */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-neutral-400 space-y-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
            <span>Loading community syntheses...</span>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-neutral-900/40 p-8 text-center backdrop-blur-xl">
            <MessageSquare className="h-8 w-8 mx-auto text-neutral-500 mb-2" />
            <h3 className="text-sm font-semibold text-white">No syntheses found</h3>
            <p className="mt-1 text-xs text-neutral-400">
              {activeTab === "current"
                ? "Be the first to learn this topic and publish a summary!"
                : "Try adjusting your filters or search terms."}
            </p>
          </div>
        ) : (
          filteredSummaries.map((summary) => (
            <div
              key={summary.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-xl shadow-lg hover:border-white/20 transition-all"
            >
              {/* Card Header: Topic Badge + Author info */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[200px]">
                  <button
                    onClick={() => onSelectTopic && onSelectTopic(summary.topic_id)}
                    className="text-left text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors line-clamp-2"
                  >
                    {summary.topic_title}
                  </button>
                  <div className="mt-1 flex items-center space-x-2 text-[11px] text-neutral-400 font-mono">
                    <span className="flex items-center text-neutral-300">
                      <User className="h-3 w-3 mr-1 text-sky-400" />
                      @{summary.author_name}
                    </span>
                    <span>•</span>
                    <span>{formatRelativeTime(summary.created_at)}</span>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex items-center space-x-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-amber-300 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-mono font-bold text-xs">
                    {summary.average_score > 0 ? summary.average_score.toFixed(1) : "—"}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    /10 ({summary.ratings_count})
                  </span>
                </div>
              </div>

              {/* Summary Text Content */}
              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-neutral-300 whitespace-pre-line font-normal">
                {summary.content}
              </p>

              {/* Paper Notes Thumbnail if available */}
              {summary.paper_note_image_url && (
                <div className="mt-3">
                  <button
                    onClick={() => setSelectedImage(summary.paper_note_image_url!)}
                    className="inline-flex items-center space-x-1.5 text-xs text-sky-300 hover:text-sky-200 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>View handwritten paper notes</span>
                  </button>
                </div>
              )}

              {/* Interactive 1-10 Rating Bar */}
              <div className="mt-4 pt-3 border-t border-white/10">
                <RatingBar
                  summaryId={summary.id}
                  authorId={summary.author_id}
                  currentUserId={currentUserId}
                  userRating={summary.user_rating}
                  onRate={(score) => onRateSummary(summary.id, score)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Image Modal Preview */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/20 bg-neutral-900 p-2">
            <img
              src={selectedImage}
              alt="Handwritten paper notes"
              className="max-h-[80vh] w-auto rounded-xl object-contain"
            />
            <div className="p-2 text-center text-xs text-neutral-400">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
