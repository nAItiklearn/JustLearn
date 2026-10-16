"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface RatingBarProps {
  summaryId: string;
  authorId: string;
  currentUserId: string;
  userRating?: number | null;
  onRate: (score: number) => Promise<void>;
  disabled?: boolean;
}

export function RatingBar({
  summaryId,
  authorId,
  currentUserId,
  userRating,
  onRate,
  disabled = false,
}: RatingBarProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwnSummary = Boolean(currentUserId && authorId && currentUserId === authorId);

  const handleVote = async (score: number) => {
    if (disabled || isOwnSummary || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onRate(score);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOwnSummary) {
    return (
      <div className="text-xs text-neutral-400 dark:text-neutral-500 font-light italic py-1">
        Your synthesis (peer voting only)
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-light text-neutral-500 dark:text-neutral-400">
        <span>Award marks (1–10):</span>
        {userRating && (
          <span className="text-amber-700 dark:text-amber-400 font-medium flex items-center space-x-1">
            <Check className="h-3 w-3" />
            <span>You voted {userRating}/10</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 w-full">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => {
          const isSelected = userRating === score;

          return (
            <button
              key={score}
              type="button"
              onClick={() => handleVote(score)}
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
    </div>
  );
}
