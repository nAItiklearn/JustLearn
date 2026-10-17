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
import { SEED_TOPICS, getTopicDuration } from "@/data/seed-topics";
import { fetchTopics, submitSummary } from "@/lib/data-service";
import { ArrowUpRight, RotateCcw, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>(SEED_TOPICS);
  const [targetTopic, setTargetTopic] = useState<Topic>(SEED_TOPICS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isTimerFinished, setIsTimerFinished] = useState<boolean>(false);

  useEffect(() => {
    fetchTopics().then((res) => {
      if (res && res.length > 0) {
        setTopics(res);
      }
    });

    // Restore active sprint after page refresh or navigation
    try {
      const saved = localStorage.getItem("justlearn_active_sprint");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.topic && parsed?.isLocked) {
          setTargetTopic(parsed.topic);
          setIsLocked(true);
          setIsTimerFinished(Boolean(parsed.isTimerFinished));
        }
      }
    } catch {}
  }, []);

  const handleStartRoll = () => {
    if (isRolling || isLocked) return;

    let pool = topics;
    if (selectedDifficulty !== "All") {
      pool = topics.filter((t) => t.difficulty === selectedDifficulty);
      if (pool.length === 0) pool = topics;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex] || SEED_TOPICS[0];
    setTargetTopic(chosen);
    setIsRolling(true);
  };

  const handleWheelFinished = () => {
    setIsRolling(false);
    setIsLocked(true);
    try {
      localStorage.setItem(
        "justlearn_active_sprint",
        JSON.stringify({
          topic: targetTopic,
          isLocked: true,
          isTimerFinished: false,
          startedAt: Date.now(),
        })
      );
    } catch {}
  };

  const handleTimerComplete = () => {
    setIsTimerFinished(true);
    try {
      const saved = localStorage.getItem("justlearn_active_sprint");
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.isTimerFinished = true;
        localStorage.setItem("justlearn_active_sprint", JSON.stringify(parsed));
      }
    } catch {}
  };

  const handleAbandonSprint = () => {
    if (confirm("Abandon this sprint and return to the roll screen?")) {
      try {
        localStorage.removeItem("justlearn_active_sprint");
        localStorage.removeItem(`justlearn_timer_${targetTopic.id}`);
      } catch {}
      setIsLocked(false);
      setIsRolling(false);
      setIsTimerFinished(false);
    }
  };

  const handlePublish = async (data: {
    topic_id: string;
    topic_title: string;
    author_name: string;
    content: string;
    paper_note_image_url?: string;
  }) => {
    await submitSummary(data);
    try {
      localStorage.removeItem("justlearn_active_sprint");
      localStorage.removeItem(`justlearn_timer_${targetTopic.id}`);
    } catch {}
    router.push("/community");
  };

  const durationMin = getTopicDuration(targetTopic);

  return (
    <main className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full px-4 sm:px-8 lg:px-12 py-8 sm:py-16 md:py-20 transition-colors">
      {/* 1. INITIAL STATE: Minimalist 2-Column Hero */}
      {!isLocked && !isRolling && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center my-auto w-full">
          {/* LEFT: ONLY THE 3D DICE */}
          <div className="md:col-span-5 flex items-center justify-center py-4 sm:py-6">
            <RabbitHoleCube isRolling={false} onClick={handleStartRoll} />
          </div>

          {/* RIGHT: DESCRIPTION OF THE WEBSITE */}
          <div className="md:col-span-7 flex flex-col items-start text-left space-y-5 sm:space-y-6">
            {/* Plain Eyebrow Tag */}
            <div className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 dark:text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Feynman Technique × Pomodoro</span>
            </div>

            {/* Plain, Clean Headline */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
              Ten minutes on paper. <br />
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Synthesize from memory.
              </span>
            </h1>

            {/* Plain, Clean Website Description */}
            <p className="text-sm sm:text-base md:text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed max-w-xl font-normal">
              JustLearn is a cognitive sprint designed to break passive consumption. Roll the dice to lock in a random seed topic across science, computing, or philosophy. For ten uninterrupted minutes, research offline on physical paper. When the timer hits zero, explain the concept simply from memory—and let the community rate your clarity from 1 to 10.
            </p>

            {/* Difficulty Level Selector */}
            <div className="space-y-2 pt-1 w-full">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Sprint Difficulty Level:</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {(
                  [
                    { key: "All", label: "All Levels (Random 10m)" },
                    { key: "Easy", label: "Easy (5m Sprint)" },
                    { key: "Medium", label: "Medium (10m Sprint)" },
                    { key: "Hard", label: "Hard (15m Deep Dive)" },
                  ] as const
                ).map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSelectedDifficulty(d.key)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                      selectedDifficulty === d.key
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-white/10 hover:border-neutral-400"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
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
          {/* Top Sprint Bar: Abandon / Reset Option */}
          <div className="flex items-center justify-between px-2 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                Active Sprint Restored & Synced
              </span>
            </div>
            <button
              type="button"
              onClick={handleAbandonSprint}
              className="flex items-center space-x-1.5 text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Abandon Sprint & Roll New Topic</span>
            </button>
          </div>

          <LockedTopicCard topic={targetTopic} />

          <ResearchTimer
            topicId={targetTopic.id}
            topicTitle={targetTopic.title}
            durationMinutes={durationMin}
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
