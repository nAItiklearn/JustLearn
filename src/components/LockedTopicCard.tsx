"use client";

import React, { useState } from "react";
import { Topic } from "@/types/database";
import { ArrowUpRight, Lock } from "lucide-react";
import { AsciiEffect } from "@/components/ui/ascii-effect";

interface LockedTopicCardProps {
  topic: Topic;
}

export function LockedTopicCard({ topic }: LockedTopicCardProps) {
  const [asciiMode, setAsciiMode] = useState<"flow" | "image" | "glitch">("flow");

  const wikiUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic.title)}`;
  const redditUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(topic.title)}`;
  const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(topic.title)}`;

  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-xl transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Topic Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Minimalist Category Header */}
            <div className="flex items-center space-x-2.5 text-xs tracking-[0.2em] uppercase font-mono text-amber-700 dark:text-amber-400">
              <span className="inline-flex items-center space-x-1 font-semibold">
                <Lock className="h-3 w-3" />
                <span>{topic.category}</span>
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="text-neutral-500 dark:text-neutral-400">{topic.difficulty}</span>
            </div>

            {/* Topic Title */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-light tracking-[-0.03em] text-neutral-900 dark:text-white leading-[1.15]">
              {topic.title}
            </h2>

            {/* Curiosity Hook */}
            <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed text-neutral-600 dark:text-neutral-300">
              {topic.hook}
            </p>
          </div>

          {/* Research Links */}
          <div className="pt-2">
            <span className="text-xs text-neutral-400 dark:text-neutral-500 block mb-2.5 font-light">
              External Research Launchpad:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all hover:border-neutral-300 dark:hover:border-white/20"
              >
                <span>Wikipedia</span>
                <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              </a>
              <a
                href={redditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all hover:border-neutral-300 dark:hover:border-white/20"
              >
                <span>Reddit</span>
                <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              </a>
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all hover:border-neutral-300 dark:hover:border-white/20"
              >
                <span>Google</span>
                <ArrowUpRight className="h-3 w-3 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: High-Density Classical ASCII Statue (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-neutral-800 bg-[#07090d] p-3.5 overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-2 px-1 text-[11px] font-mono text-neutral-400">
            <span className="tracking-widest uppercase text-white/80 font-medium">Statue Matrix</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setAsciiMode("flow")}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  asciiMode === "flow" ? "bg-white/20 text-white font-medium" : "text-neutral-400 hover:text-white"
                }`}
              >
                flow
              </button>
              <button
                onClick={() => setAsciiMode("image")}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  asciiMode === "image" ? "bg-white/20 text-white font-medium" : "text-neutral-400 hover:text-white"
                }`}
              >
                bust
              </button>
              <button
                onClick={() => setAsciiMode("glitch")}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                  asciiMode === "glitch" ? "bg-white/20 text-white font-medium" : "text-neutral-400 hover:text-white"
                }`}
              >
                glitch
              </button>
            </div>
          </div>

          <div className="relative h-60 sm:h-72 w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
            <AsciiEffect
              imageSrc="/images/statue.jpg"
              variant={asciiMode}
              chars={asciiMode === "glitch" ? "█▓▒░#*+=-:. " : ".:-=+*#%@"}
              fontSize={7}
              scale={1.15}
              contrast={1.1}
              brightnessBoost={2.2}
              colors={asciiMode === "flow" ? ["#f59e0b", "#fbbf24"] : asciiMode === "glitch" ? ["#38bdf8", "#0284c7"] : ["#f8fafc", "#e2e8f0"]}
              className="w-full h-full flex items-center justify-center"
            />
          </div>

          <div className="mt-2 text-center text-[10px] font-mono text-neutral-500">
            Offline 10-Minute Synthesis Artifact
          </div>
        </div>
      </div>
    </div>
  );
}
