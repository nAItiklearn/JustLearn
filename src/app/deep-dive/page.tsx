"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Brain, Clock, Award, ShieldCheck, PenTool } from "lucide-react";

export default function DeepDivePage() {
  return (
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-16 md:py-20 space-y-12 sm:space-y-16 transition-colors">
      {/* Top Header Section */}
      <section className="space-y-4 text-left">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Curiosity Protocol</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-black dark:text-white leading-tight">
          The JustLearn Philosophy
        </h1>

        <p className="text-base sm:text-xl text-neutral-800 dark:text-neutral-200 font-normal leading-relaxed max-w-3xl">
          An intentional learning system combining the Feynman technique with ten minute focused sprints to break passive digital consumption.
        </p>
      </section>

      {/* The Core Problem and Solution */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400">
            <Brain className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            The Illusion of Competence
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
            Modern internet browsing creates a dangerous trap. When we read documentation, watch technical videos, or save bookmarks, our brain feels satisfied. We confuse recognition with true mastery. When asked to articulate the idea without looking at notes, our mind goes completely blank.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400">
            <PenTool className="h-5 w-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
            The Power of Physical Paper
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
            Writing with pen on physical paper introduces friction that typed notes lack. You cannot copy paste. You cannot open twelve browser tabs. You must mentally filter, condense, and sketch concepts with spatial freedom. This unlocks deeper memory encoding before you write your synthesis.
          </p>
        </div>
      </section>

      {/* The Four Protocol Steps */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold">
            The Four Step Cycle
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight mt-1">
            How Every Sprint Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-7 space-y-3">
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              Stage 01
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Roll for a Seed Topic
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
              Click the three dimensional dice to spin the drum wheel. The engine selects a curiosity seed spanning physics, computing architectures, game theory, or philosophy. The topic locks so you commit without second guessing.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-7 space-y-3">
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              Stage 02
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Ten Minute Deep Research
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
              A single countdown starts. You have ten uninterrupted minutes to explore the core mechanism. Grab a physical pen and notebook. Jot bullet ideas, arrows, diagrams, and equations offline.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-7 space-y-3">
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              Stage 03
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Feynman Memory Synthesis
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
              Once the chime alerts completion, the editor unlocks. Explain the topic simply using only what remains in your brain. You can also upload a photo of your paper notes to earn twenty five bonus points.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-7 space-y-3">
            <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">
              Stage 04
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Peer Review and Recognition
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
              Your explanation publishes to the community stream. Fellow thinkers read your mental synthesis and rate its intuitive clarity on a scale from 1 to 10. High ratings advance your position on the leaderboard.
            </p>
          </div>
        </div>
      </section>

      {/* The Richard Feynman Technique Explained */}
      <section className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-600 dark:text-amber-400">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              The Feynman Technique
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              Nobel Laureate Richard Feynman Principle
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-light">
          Physicist Richard Feynman discovered that jargon is often used to conceal ignorance. Anyone can recite complex terms they memorized yesterday. Real genius is taking an intricate mechanism, such as quantum entanglement or distributed consensus, and explaining it so clearly that a twelve year old immediately grasps the essence.
        </p>

        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-white/10 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            The Golden Rule of JustLearn
          </div>
          <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-light leading-relaxed">
            If you cannot explain the central breakthrough simply in three sentences, you do not truly understand it yet. That is not failure. That is the exact moment authentic learning begins.
          </p>
        </div>
      </section>

      {/* Bottom Call to Action */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 sm:p-10 rounded-3xl border border-black/10 dark:border-white/10 bg-neutral-950 text-white">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to test your memory?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Roll the dice, silence distractions, and discover what your brain can synthesize in ten minutes.
          </p>
        </div>

        <Link
          href="/"
          className="group flex items-center space-x-2 rounded-full bg-amber-400 hover:bg-amber-300 text-neutral-950 px-6 py-3 text-sm font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <span>Begin Sprint</span>
          <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </section>
    </main>
  );
}
