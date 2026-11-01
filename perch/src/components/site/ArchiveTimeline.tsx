"use client";

import { Fragment, useEffect, useState } from "react";

const STAGES = [
  { key: "active", label: "Active", sub: "trial running" },
  { key: "ended", label: "Ended", sub: "+3 days grace" },
  { key: "dropped", label: "Dropped", sub: "+45 days cleanup" },
];

export function ArchiveTimeline() {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setReady(true);
    const tick = setInterval(() => {
      setStage((s) => (s + 1) % STAGES.length);
    }, 2400);
    return () => clearInterval(tick);
  }, []);

  if (!ready) return <div className="card h-[200px] animate-pulse" style={{ background: "var(--card)" }} />;

  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="px-5 pt-4 pb-3 border-b hairline flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Ended & archived</div>
          <div className="text-[15px] font-medium">a lapsed trial</div>
        </div>
        <span className="text-[11.5px] text-[var(--ink-faint)]">simulated in your browser</span>
      </div>
      <div className="px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0" style={{ background: "#111111" }}>N</span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-medium truncate">Notion (work plan)</div>
            <div className="text-[12.5px] text-[var(--ink-faint)]">free trial · ended 3 days ago</div>
          </div>
        </div>

        <div className="mt-5 flex items-center">
          {STAGES.map((s, i) => (
            <Fragment key={s.key}>
              <div className="flex flex-col items-center w-[92px] shrink-0">
                <div
                  className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold border transition-colors ${
                    i === stage
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : i < stage
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]"
                      : "bg-transparent text-[var(--ink-faint)] border-[var(--line)]"
                  }`}
                >
                  {i + 1}
                </div>
                <div className={`mt-1.5 text-[11.5px] font-medium ${i === stage ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"}`}>{s.label}</div>
                <div className="text-[10.5px] text-[var(--ink-faint)]">{s.sub}</div>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`h-px flex-1 mx-1 transition-colors ${i < stage ? "bg-[var(--accent)]" : "bg-[var(--line)]"}`} />
              )}
            </Fragment>
          ))}
        </div>

        <div className="mt-4 text-[12px] text-[var(--ink-soft)]">
          {stage === 0 && "Active: trial still running, counted in trials."}
          {stage === 1 && "Ended: grace window open — undoable for 45 days."}
          {stage === 2 && "Dropped: gone from the shelf entirely."}
        </div>
      </div>
    </div>
  );
}
