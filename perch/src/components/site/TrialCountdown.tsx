"use client";

import { useEffect, useState } from "react";

export function TrialCountdown() {
  const [ready, setReady] = useState(false);
  const [days, setDays] = useState(4);

  useEffect(() => {
    setReady(true);
    const tick = setInterval(() => {
      setDays((d) => (d <= 0 ? 4 : d - 1));
    }, 1100);
    return () => clearInterval(tick);
  }, []);

  if (!ready) return <div className="card h-[180px] animate-pulse" style={{ background: "var(--card)" }} />;

  const urgent = days <= 1;

  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="px-5 pt-4 pb-3 border-b hairline flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Trials</div>
          <div className="text-[15px] font-medium">Notion (work plan)</div>
        </div>
        <span className="text-[11.5px] text-[var(--ink-faint)]">simulated in your browser</span>
      </div>
      <div className="px-5 py-5 flex items-center gap-4">
        <div className="flex-1">
          <div className="text-[12.5px] text-[var(--ink-faint)]">trial ends in</div>
          <div className={`stat-num text-[44px] font-semibold leading-none mt-1 ${urgent ? "text-[var(--red)]" : "text-[var(--ink)]"}`}>
            {days}
            <span className="text-[18px] font-medium text-[var(--ink-soft)] ml-1.5">day{days === 1 ? "" : "s"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full ${urgent ? "tone-now" : "tone-soon"}`}>
            {urgent ? "decide now" : "ending soon"}
          </span>
          <span className="text-[11.5px] text-[var(--ink-faint)]">free trial · no card charged yet</span>
        </div>
      </div>
      <div className="px-5 pb-4 text-[12.5px] text-[var(--ink-soft)]">
        At 0 days Perch marks it ended and moves it off the active shelf. You decide before the card does.
      </div>
    </div>
  );
}
