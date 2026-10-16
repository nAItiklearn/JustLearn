"use client";

import React, { useState } from "react";
import { Topic } from "@/types/database";
import { 
  Dices, 
  ExternalLink, 
  Search, 
  Sparkles, 
  Brain, 
  Cpu, 
  Microscope, 
  TrendingUp, 
  Landmark, 
  RotateCcw,
  CheckCircle2,
  Terminal
} from "lucide-react";
import { AsciiEffect } from "@/components/ui/ascii-effect";

interface TopicGeneratorProps {
  currentTopic: Topic;
  onRollTopic: () => void;
  rerollsLeft: number;
  timerActive: boolean;
  onLockInTopic: () => void;
}

const CATEGORY_STYLES: Record<string, { badge: string; icon: React.ReactNode; text: string }> = {
  "Psychology & Human Behavior": {
    badge: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    icon: <Brain className="h-3.5 w-3.5 mr-1 text-purple-400" />,
    text: "Psychology & Behavior",
  },
  "Tech & Computer Science": {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    icon: <Cpu className="h-3.5 w-3.5 mr-1 text-emerald-400" />,
    text: "Tech & Computing",
  },
  "Science, Biology & Nature": {
    badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",
    icon: <Microscope className="h-3.5 w-3.5 mr-1 text-teal-400" />,
    text: "Science & Nature",
  },
  "Economics & Game Theory": {
    badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    icon: <TrendingUp className="h-3.5 w-3.5 mr-1 text-amber-400" />,
    text: "Game Theory & Systems",
  },
  "History & Design Mysteries": {
    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",
    icon: <Landmark className="h-3.5 w-3.5 mr-1 text-sky-400" />,
    text: "History & Design",
  },
};

export function TopicGenerator({
  currentTopic,
  onRollTopic,
  rerollsLeft,
  timerActive,
  onLockInTopic,
}: TopicGeneratorProps) {
  const [asciiMode, setAsciiMode] = useState<"flow" | "image" | "glitch">("flow");

  const catConfig = CATEGORY_STYLES[currentTopic.category] || {
    badge: "bg-white/10 text-white border-white/15",
    icon: <Sparkles className="h-3.5 w-3.5 mr-1 text-sky-400" />,
    text: currentTopic.category,
  };

  const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(currentTopic.title)}`;
  const redditUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(currentTopic.title)}`;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(currentTopic.title)}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Main Container: Split into Topic details + ASCII artwork side container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left/Primary Side: Topic Details (8 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
          {/* Top Metadata Badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${catConfig.badge}`}>
                {catConfig.icon}
                {catConfig.text}
              </span>
              <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-neutral-400">
                Level: {currentTopic.difficulty}
              </span>
              {currentTopic.times_completed > 0 && (
                <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] font-mono text-neutral-400">
                  {currentTopic.times_completed} learners
                </span>
              )}
            </div>

            {/* Topic Title */}
            <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight text-white leading-snug">
              {currentTopic.title}
            </h2>

            {/* 1-Sentence Curiosity Hook */}
            <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-neutral-300 font-normal">
              "{currentTopic.hook}"
            </p>
          </div>

          {/* Quick External Research Pills */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-neutral-400 mb-2">
              <Search className="h-3.5 w-3.5 text-sky-400" />
              <span>Launch your 10-minute web dive:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/20 active:scale-95"
              >
                <span>Wikipedia</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>
              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/20 active:scale-95"
              >
                <span>Reddit</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-white/20 active:scale-95"
              >
                <span>Google</span>
                <ExternalLink className="h-3 w-3 text-neutral-400" />
              </a>
            </div>
          </div>

          {/* Action Row: Re-roll button + Session Counter */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <button
                onClick={onRollTopic}
                disabled={rerollsLeft <= 0 || timerActive}
                className={`inline-flex items-center space-x-2 rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  rerollsLeft > 0 && !timerActive
                    ? "bg-white/10 hover:bg-white/15 active:scale-95 text-white border border-white/15"
                    : "bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed"
                }`}
                title={
                  timerActive
                    ? "Timer is active for this topic"
                    : rerollsLeft <= 0
                    ? "No re-rolls remaining for this session"
                    : "Draw a different rabbit hole"
                }
              >
                <Dices className="h-4 w-4 text-sky-400" />
                <span>Roll Another Topic</span>
              </button>

              <span className="text-[11px] font-mono text-neutral-400">
                {rerollsLeft} / 3 re-rolls left
              </span>
            </div>

            {timerActive ? (
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 px-3 py-1 text-xs text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>Timer Active</span>
              </div>
            ) : (
              <button
                onClick={onLockInTopic}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Lock In & Start Timer</span>
              </button>
            )}
          </div>
        </div>

        {/* Right/Adjacent Side: Componentry AsciiEffect Art Block */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-white/10 bg-black/40 p-3 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-neutral-400 font-mono">
            <span className="flex items-center space-x-1 text-sky-300">
              <Terminal className="h-3 w-3" />
              <span>curiosity.matrix</span>
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAsciiMode("flow")}
                className={`px-1.5 py-0.5 rounded text-[10px] ${asciiMode === "flow" ? "bg-sky-500/20 text-sky-300" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                flow
              </button>
              <button
                onClick={() => setAsciiMode("image")}
                className={`px-1.5 py-0.5 rounded text-[10px] ${asciiMode === "image" ? "bg-sky-500/20 text-sky-300" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                still
              </button>
              <button
                onClick={() => setAsciiMode("glitch")}
                className={`px-1.5 py-0.5 rounded text-[10px] ${asciiMode === "glitch" ? "bg-sky-500/20 text-sky-300" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                glitch
              </button>
            </div>
          </div>

          {/* ASCII Effect Canvas */}
          <div className="relative mt-2 h-44 sm:h-52 w-full overflow-hidden rounded-lg bg-neutral-950/80">
            <AsciiEffect
              imageSrc="/images/rabbit-thinker.jpg"
              variant={asciiMode}
              fontSize={8}
              scale={1.05}
              contrast={1.2}
              brightnessBoost={2.0}
              className="h-full w-full"
              backgroundColor="#0a0a0c"
            />
          </div>

          <div className="mt-2 text-[10px] text-neutral-500 font-mono text-center truncate">
            Thinker Matrix • Interactive ASCII ripple
          </div>
        </div>
      </div>
    </div>
  );
}
