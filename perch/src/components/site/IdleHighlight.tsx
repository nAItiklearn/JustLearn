"use client";

import { useEffect, useState } from "react";

export function IdleHighlight() {
  const [ready, setReady] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setReady(true);
    let cancelled = false;
    const show = () => { if (!cancelled) setShowHint(true); };
    const hide = () => { if (!cancelled) setShowHint(false); };
    const t = setTimeout(show, 900);
    const cycle = setInterval(() => {
      hide();
      setTimeout(show, 900);
    }, 5000);
    return () => { cancelled = true; clearTimeout(t); clearInterval(cycle); };
  }, []);

  if (!ready) return <div className="card h-[180px] animate-pulse" style={{ background: "var(--card)" }} />;

  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="px-5 pt-4 pb-3 border-b hairline flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Maybe unused</div>
          <div className="text-[15px] font-medium">Old cloud host</div>
        </div>
        <span className="text-[11.5px] text-[var(--ink-faint)]">simulated in your browser</span>
      </div>
      <div className="px-5 py-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0" style={{ background: "hsl(12 62% 42%)" }}>O</span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-medium truncate">Old cloud host</div>
          <div className="text-[12.5px] text-[var(--ink-faint)]">$144 · yearly</div>
        </div>
        <span className="text-[12px] text-[var(--ink-soft)] tabular-nums shrink-0">next charge in 190 days</span>
      </div>
      <div className="px-5 pb-4">
        <div className="text-[12.5px] text-[var(--ink-soft)]">
          Last supporting email: <span className="font-medium text-[var(--ink)]">285 days ago</span>.
        </div>
        {showHint && (
          <div className="mt-2 perch-in">
            <span className="text-[11.5px] bg-[var(--amber-soft)] text-[var(--amber)] px-2 py-0.5 rounded-full">
              maybe unused — last email 285 days ago
            </span>
            <span className="ml-2 text-[12px] text-[var(--ink-faint)]">threshold 120 days, yours to change</span>
          </div>
        )}
      </div>
    </div>
  );
}
