"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RabbitHoleCube } from "@/components/RabbitHoleCube";
import { TopicWheel } from "@/components/TopicWheel";
import { LockedTopicCard } from "@/components/LockedTopicCard";
import { ResearchTimer } from "@/components/ResearchTimer";
import { SummaryEditor } from "@/components/SummaryEditor";
import { Topic } from "@/types/database";
import { SEED_TOPICS } from "@/data/seed-topics";
import { fetchTopics, submitSummary } from "@/lib/data-service";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(SEED_TOPICS);
  const [targetTopic, setTargetTopic] = useState<Topic>(SEED_TOPICS[0]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isTimerFinished, setIsTimerFinished] = useState<boolean>(false);

  useEffect(() => {
    fetchTopics().then((res) => {
      if (res && res.length > 0) {
        setTopics(res);
      }
    });
  }, []);

  const handleStartRoll = () => {
    if (isRolling || isLocked) return;

    const randomIndex = Math.floor(Math.random() * topics.length);
    const chosen = topics[randomIndex] || SEED_TOPICS[0];
    setTargetTopic(chosen);
    setIsRolling(true);
  };

  const handleWheelFinished = () => {
    setIsRolling(false);
    setIsLocked(true);
  };

  const handleTimerComplete = () => {
    setIsTimerFinished(true);
  };

  const handlePublish = async (data: {
    topic_id: string;
    topic_title: string;
    author_name: string;
    content: string;
    paper_note_image_url?: string;
  }) => {
    await submitSummary(data);
    router.push("/community");
  };

  return (
    <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-16 md:py-20 transition-colors">
      {/* 1. INITIAL STATE: Minimalist 2-Column Hero */}
      {/* LEFT: ONLY THE 3D DICE. RIGHT: DESCRIPTION OF WEBSITE */}
      {!isLocked && !isRolling && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center my-auto w-full">
          {/* LEFT: ONLY THE 3D DICE */}
          <div className="md:col-span-5 flex items-center justify-center py-4 sm:py-6">
            <RabbitHoleCube isRolling={false} onClick={handleStartRoll} />
          </div>

          {/* RIGHT: DESCRIPTION OF THE WEBSITE */}
          <div className="md:col-span-7 flex flex-col items-start text-left space-y-5 sm:space-y-6">
            {/* Plain Eyebrow Tag */}
            <div className="flex items-center space-x-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Feynman Technique × Pomodoro</span>
            </div>

            {/* Plain, Clean Headline */}
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Ten minutes on paper. <br />
              <span className="font-normal text-neutral-600 dark:text-neutral-300">
                Synthesize from memory.
              </span>
            </h1>

            {/* Plain, Clean Website Description */}
            <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl font-light">
              TenMinRabbitHole is a cognitive sprint designed to break passive consumption. Roll the dice to lock in a random seed topic across science, computing, or philosophy. For ten uninterrupted minutes, research offline on physical paper. When the timer hits zero, explain the concept simply from memory—and let the community rate your clarity from 1 to 10.
            </p>

            {/* Plain Minimalist Tags */}
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-neutral-300">
              <span className="rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 px-3.5 py-1.5 shadow-xs">
                32 Seed Topics
              </span>
              <span className="rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 px-3.5 py-1.5 shadow-xs">
                10-Min Timer
              </span>
              <span className="rounded-full border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 px-3.5 py-1.5 shadow-xs">
                Physical Paper Notes
              </span>
              <span className="rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 shadow-xs font-medium text-amber-900 dark:text-amber-300">
                1–10 Peer Rating
              </span>
            </div>

            {/* Plain Clean Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={handleStartRoll}
                className="group flex items-center justify-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-7 py-3.5 text-base font-medium shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Roll Dice</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <Link
                href="/community"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors text-center sm:text-left py-2"
              >
                Explore Community Syntheses →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROLLING ANIMATION STATE */}
      {isRolling && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center my-auto w-full">
          {/* Tumble Rolling Dice on Left */}
          <div className="md:col-span-5 flex items-center justify-center py-4">
            <RabbitHoleCube isRolling={true} />
          </div>

          {/* Mechanical Slot Drum Wheel on Right */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <TopicWheel
              topics={topics}
              targetTopic={targetTopic}
              onFinished={handleWheelFinished}
            />
          </div>
        </div>
      )}

      {/* 3. LOCKED STATE: Topic Locked + Timer + Feynman Synthesis Editor */}
      {isLocked && (
        <div className="space-y-8 sm:space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto w-full">
          <LockedTopicCard topic={targetTopic} />

          <ResearchTimer
            topicId={targetTopic.id}
            topicTitle={targetTopic.title}
            soundEnabled={true}
            onTimerComplete={handleTimerComplete}
            isUnlocked={isTimerFinished}
          />

          <SummaryEditor
            isUnlocked={isTimerFinished}
            topicTitle={targetTopic.title}
            topicId={targetTopic.id}
            onPublish={handlePublish}
          />
        </div>
      )}
    </main>
  );
}
