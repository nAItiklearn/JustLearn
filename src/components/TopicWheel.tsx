"use client";

import React, { useState, useEffect } from "react";
import { Topic } from "@/types/database";
import { Check } from "lucide-react";

interface TopicWheelProps {
  topics: Topic[];
  targetTopic: Topic;
  onFinished: () => void;
}

export function TopicWheel({ topics, targetTopic, onFinished }: TopicWheelProps) {
  const [offsetIndex, setOffsetIndex] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let speed = 40;
    let elapsed = 0;
    const totalDuration = 3000; // 3 seconds full scrolling wheel

    const interval = setInterval(() => {
      elapsed += speed;
      setOffsetIndex((prev) => (prev + 1) % topics.length);

      // Decelerate toward the end
      if (elapsed > totalDuration * 0.5) {
        speed += 12;
      }
      if (elapsed > totalDuration * 0.75) {
        speed += 28;
      }

      if (elapsed >= totalDuration) {
        clearInterval(interval);
        setIsLocked(true);
        setTimeout(() => {
          onFinished();
        }, 900);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [topics, onFinished]);

  // Render 3 items: previous, current (centered), next
  const getTopicAt = (offset: number) => {
    if (isLocked) {
      if (offset === 0) return targetTopic;
      const targetIdx = topics.findIndex((t) => t.id === targetTopic.id);
      const idx = (targetIdx + offset + topics.length) % topics.length;
      return topics[idx] || targetTopic;
    }
    const idx = (offsetIndex + offset + topics.length) % topics.length;
    return topics[idx] || targetTopic;
  };

  const topItem = getTopicAt(-1);
  const centerItem = isLocked ? targetTopic : getTopicAt(0);
  const bottomItem = getTopicAt(1);

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center transition-all">
      <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-amber-600 dark:text-amber-400 mb-4 font-semibold">
        {isLocked ? "Rabbit Hole Confirmed" : "Curiosity Wheel Spinning"}
      </div>

      {/* Mechanical Slot Drum Frame (3 slots tall) */}
      <div className="relative h-48 sm:h-56 overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10 bg-[#fbfbfd] dark:bg-black/60 flex flex-col justify-around px-4 sm:px-6 py-2 select-none shadow-inner">
        {/* Top & Bottom Depth Shadows */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-[#fbfbfd] dark:from-black via-[#fbfbfd]/80 dark:via-black/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#fbfbfd] dark:from-black via-[#fbfbfd]/80 dark:via-black/80 to-transparent z-10" />

        {/* Center Target Indicator Bar */}
        <div className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 h-14 rounded-xl border border-amber-400/80 bg-amber-400/10 z-0" />

        {/* Slot Item Above */}
        <div className="text-xs sm:text-sm font-light text-neutral-400 dark:text-neutral-500 truncate opacity-40 z-10 scale-95 transition-all">
          {topItem.title}
        </div>

        {/* Center Highlighted Slot Item */}
        <div className="relative z-10 py-1 px-2">
          <div
            className={`text-base sm:text-xl font-medium tracking-tight text-neutral-900 dark:text-white transition-all duration-150 ${
              isLocked ? "scale-105 text-neutral-950 dark:text-white font-semibold" : "opacity-95"
            }`}
          >
            {centerItem.title}
          </div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-mono tracking-wider mt-0.5 uppercase">
            {centerItem.category}
          </div>
        </div>

        {/* Slot Item Below */}
        <div className="text-xs sm:text-sm font-light text-neutral-400 dark:text-neutral-500 truncate opacity-40 z-10 scale-95 transition-all">
          {bottomItem.title}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center space-x-2 text-xs font-light text-neutral-500 dark:text-neutral-400">
        {isLocked ? (
          <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium space-x-1.5 animate-bounce">
            <Check className="h-4 w-4" />
            <span>Topic locked in! Entering 10-minute focus...</span>
          </span>
        ) : (
          <span>Decelerating wheel to select your topic...</span>
        )}
      </div>
    </div>
  );
}
