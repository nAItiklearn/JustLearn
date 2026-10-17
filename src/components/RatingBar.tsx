"use client";

import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, MessageSquare, AlertTriangle, Sparkles } from "lucide-react";
import { FeedbackItem } from "@/types/database";

interface RatingBarProps {
  summaryId: string;
  authorId: string;
  currentUserId: string;
  userRating?: number | null;
  userFeedback?: FeedbackItem | null;
  onRate: (
    score: number,
    options?: {
      accuracy: number;
      clarity: number;
      completeness: number;
      comment?: string;
      isCorrection?: boolean;
    }
  ) => Promise<void>;
  disabled?: boolean;
}

export function RatingBar({
  summaryId,
  authorId,
  currentUserId,
  userRating,
  userFeedback,
  onRate,
  disabled = false,
}: RatingBarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  // Criteria review state
  const [accuracy, setAccuracy] = useState<number>(userFeedback?.accuracy || userRating || 8);
  const [clarity, setClarity] = useState<number>(userFeedback?.clarity || userRating || 8);
  const [completeness, setCompleteness] = useState<number>(userFeedback?.completeness || userRating || 8);
  const [comment, setComment] = useState<string>(userFeedback?.comment || "");
  const [isCorrection, setIsCorrection] = useState<boolean>(Boolean(userFeedback?.is_correction));

  const isOwnSummary = Boolean(currentUserId && authorId && currentUserId === authorId);

  const handleQuickVote = async (score: number) => {
    if (disabled || isOwnSummary || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onRate(score, {
        accuracy: score,
        clarity: score,
        completeness: score,
        comment: comment || undefined,
        isCorrection,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isOwnSummary || isSubmitting) return;
    const overall = Math.round(((accuracy + clarity + completeness) / 3) * 10) / 10;
    try {
      setIsSubmitting(true);
      await onRate(overall, {
        accuracy,
        clarity,
        completeness,
        comment: comment.trim() || undefined,
        isCorrection,
      });
      setShowCriteriaModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOwnSummary) {
    return (
      <div className="rounded-xl border border-neutral-200/60 dark:border-white/10 bg-neutral-50/60 dark:bg-neutral-800/40 p-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-light italic flex items-center space-x-1.5">
        <span>🔒</span>
        <span>Your synthesis (peer voting only — authors cannot rate their own work)</span>
      </div>
    );
  }

  const computedAverage = ((accuracy + clarity + completeness) / 3).toFixed(1);

  return (
    <div className="w-full space-y-2.5">
      <div className="flex flex-wrap items-center justify-between text-xs font-light text-neutral-600 dark:text-neutral-400 gap-2">
        <div className="flex items-center space-x-2">
          <span>Award marks (1–10):</span>
          {userRating && (
            <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
              <Check className="h-3 w-3 text-emerald-600" />
              <span>You voted {userRating}/10</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowCriteriaModal(!showCriteriaModal)}
          className="text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
        >
          <Sparkles className="h-3 w-3" />
          <span>{showCriteriaModal ? "Close Review Criteria" : "Detailed Feedback & Criteria"}</span>
          {showCriteriaModal ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Quick 1-10 Bar */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 w-full">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const isSelected = userRating === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => handleQuickVote(score)}
              disabled={disabled || isSubmitting}
              className={`
                flex items-center justify-center rounded-xl border text-xs font-mono transition-all
                h-9 sm:h-8 w-full select-none
                ${
                  isSelected
                    ? "bg-amber-400 text-neutral-950 font-bold border-amber-400 shadow-sm"
                    : "border-neutral-200/80 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:border-neutral-300 dark:hover:border-white/20"
                }
                ${isSubmitting ? "opacity-50 cursor-wait" : "cursor-pointer"}
              `}
              title={`Rate ${score} / 10`}
            >
              {score}
            </button>
          );
        })}
      </div>

      {/* Detailed Multi-Criteria Review Panel */}
      {showCriteriaModal && (
        <form
          onSubmit={handleDetailedSubmit}
          className="rounded-2xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 space-y-4 animate-in fade-in duration-200 text-xs"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-white/10 pb-2">
            <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-[11px]">
              Peer Cognitive Criteria Review
            </span>
            <span className="font-mono font-bold text-amber-800 dark:text-amber-300">
              Calculated Mark: {computedAverage} / 10
            </span>
          </div>

          <div className="space-y-3">
            {/* 1. Accuracy */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  1. Accuracy (Factual Correctness):
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{accuracy} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 2. Clarity */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  2. Clarity (Jargon-free & Intuitive):
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{clarity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={clarity}
                onChange={(e) => setClarity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* 3. Completeness */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  3. Completeness (Explains Core Mechanism):
                </span>
                <span className="font-mono font-bold text-neutral-900 dark:text-white">{completeness} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={completeness}
                onChange={(e) => setCompleteness(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Constructive Comment & Factual Correction */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>Constructive Feedback or Factual Correction (Optional):</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-amber-800 dark:text-amber-400 font-medium">
                <input
                  type="checkbox"
                  checked={isCorrection}
                  onChange={(e) => setIsCorrection(e.target.checked)}
                  className="rounded border-neutral-300 text-amber-500 focus:ring-amber-400 accent-amber-500"
                />
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                <span>Contains Factual Correction</span>
              </label>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="E.g., Great intuition on waves! Note: in a standing wave, nodes don't transport net energy..."
              rows={2}
              className="w-full rounded-xl border border-neutral-300 dark:border-white/10 bg-white dark:bg-neutral-900 p-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCriteriaModal(false)}
              className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Peer Review"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
