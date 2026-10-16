"use client";

import React, { useState, useEffect, useRef } from "react";
import { getUserHandle } from "@/lib/user";
import { ArrowUpRight, Lock, Image as ImageIcon, X, Upload } from "lucide-react";

interface SummaryEditorProps {
  isUnlocked: boolean;
  topicTitle: string;
  topicId: string;
  onPublish: (data: {
    topic_id: string;
    topic_title: string;
    author_name: string;
    content: string;
    paper_note_image_url?: string;
  }) => Promise<void>;
}

export function SummaryEditor({
  isUnlocked,
  topicTitle,
  topicId,
  onPublish,
}: SummaryEditorProps) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [paperNoteUrl, setPaperNoteUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthorName(getUserHandle());
  }, []);

  const wordCount = content.trim().length === 0 ? 0 : content.trim().split(/\s+/).filter(Boolean).length;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setPaperNoteUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPaperNoteUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (wordCount < 15) {
      setErrorMessage("Please write at least 15 words explaining what you learned.");
      return;
    }

    const cleanHandle = authorName.trim() || getUserHandle() || "learner";

    try {
      setIsSubmitting(true);
      await onPublish({
        topic_id: topicId,
        topic_title: topicTitle,
        author_name: cleanHandle,
        content: content.trim(),
        paper_note_image_url: paperNoteUrl || undefined,
      });
      setContent("");
      setPaperNoteUrl("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to publish summary.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isUnlocked) {
    return (
      <div className="rounded-3xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/70 dark:bg-neutral-900/50 p-6 sm:p-8 text-center backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono tracking-[0.2em] uppercase text-neutral-400 dark:text-neutral-500 font-semibold">
          <Lock className="h-3.5 w-3.5" />
          <span>Synthesis Editor Locked</span>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-light text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
          The editor unlocks automatically when the 10:00 timer hits 00:00. Looking only at your paper notes, explain the concept from scratch.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 p-6 sm:p-10 shadow-xl transition-all animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-neutral-100 dark:border-white/10">
        <div>
          <span className="text-xs font-mono tracking-[0.2em] uppercase text-amber-700 dark:text-amber-400 font-semibold">
            Feynman Technique
          </span>
          <h3 className="text-xl sm:text-2xl font-light text-neutral-900 dark:text-white tracking-tight mt-1">
            Synthesize from Memory
          </h3>
        </div>

        <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
          {wordCount} words
        </div>
      </div>

      <form onSubmit={handlePublish} className="mt-6 space-y-5">
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-neutral-900 dark:text-white">Publishing as:</span>
          <span className="font-bold text-amber-700 dark:text-amber-400">@{authorName || "learner"}</span>
          <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 px-2.5 py-0.5 text-[10px] text-neutral-600 dark:text-neutral-400 font-bold">
            Locked Identity
          </span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Looking only at your paper notes, explain "${topicTitle}" in simple, intuitive terms. What was the central breakthrough?`}
          rows={6}
          className="w-full rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-800 p-4 text-sm font-light text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:border-amber-400 focus:outline-none leading-relaxed resize-y"
          required
        />

        {/* Paper Note Photo Upload Dropzone */}
        <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-white/15 bg-neutral-50/50 dark:bg-neutral-800/40 p-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-600 dark:text-amber-400 shrink-0">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-medium text-neutral-900 dark:text-white flex items-center space-x-1.5">
                  <span>Photo of Paper / Journal Notes</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-normal">
                    (+25 Bonus Points)
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-light mt-0.5">
                  Doesn't matter if it was messy or gibberish—proves offline physical synthesis.
                </p>
              </div>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
                id="paper-note-upload"
              />
              {!paperNoteUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-1.5 rounded-full border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 px-3.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-all cursor-pointer shadow-xs"
                >
                  <Upload className="h-3 w-3" />
                  <span>Upload Photo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="flex items-center space-x-1 text-xs text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Remove photo</span>
                </button>
              )}
            </div>
          </div>

          {/* Uploaded Thumbnail Preview */}
          {paperNoteUrl && (
            <div className="mt-3 relative w-32 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/20 shadow-sm">
              <img
                src={paperNoteUrl}
                alt="Paper note preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-500 font-light">{errorMessage}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light">
            Once published, peers can review & rate your summary from 1 to 10.
          </p>

          <button
            type="submit"
            disabled={isSubmitting || wordCount < 5}
            className="group flex items-center justify-center space-x-2 rounded-full bg-neutral-900 hover:bg-black text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 px-6 py-2.5 text-xs font-medium tracking-wide transition-all shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <span>{isSubmitting ? "Publishing..." : "Publish to Community"}</span>
            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
