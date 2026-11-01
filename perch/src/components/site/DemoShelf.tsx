"use client";

import { useEffect, useMemo, useState } from "react";
import { formatRefDate, moneyLabel, urgencyFor } from "@/lib/snapshot";
import type { Item } from "@/lib/types";

interface Row {
  id: string;
  kind: Item["kind"];
  provider: string;
  accent: string;
  amount: number | null;
  currency: string | null;
  cadence: Item["cadence"];
  inDays: number;
  lastSeenDaysAgo: number;
  where?: string;
}

const ROWS: Row[] = [
  { id: "1", kind: "subscription", provider: "Figma", accent: "#a259ff", amount: 3250, currency: "INR", cadence: "yearly", inDays: 2, lastSeenDaysAgo: 340 },
  { id: "2", kind: "trial", provider: "Notion (work plan)", accent: "#111111", amount: null, currency: null, cadence: "monthly", inDays: 4, lastSeenDaysAgo: 1 },
  { id: "3", kind: "subscription", provider: "Netflix", accent: "#b1060f", amount: 649, currency: "INR", cadence: "monthly", inDays: 6, lastSeenDaysAgo: 24 },
  { id: "4", kind: "event", provider: "Sunburn Reload", accent: "#f05537", amount: 2500, currency: "INR", cadence: "unknown", inDays: 8, lastSeenDaysAgo: 18, where: "Fountain Square, MG Road" },
  { id: "5", kind: "subscription", provider: "Swiggy One", accent: "#fc8019", amount: 799, currency: "INR", cadence: "quarterly", inDays: 19, lastSeenDaysAgo: 71 },
  { id: "6", kind: "subscription", provider: "Old cloud host", accent: "hsl(12 62% 42%)", amount: 144, currency: "USD", cadence: "yearly", inDays: 190, lastSeenDaysAgo: 285 },
];

type Tab = "subscription" | "trial" | "event";

const TAB_LABELS: Record<Tab, string> = {
  subscription: "Renewals",
  trial: "Trials",
  event: "Events",
};

export function DemoShelf() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("subscription");
  const [scannedMinsAgo, setScannedMinsAgo] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    const cycle = setInterval(() => {
      setTab((cur) => (cur === "subscription" ? "trial" : cur === "trial" ? "event" : "subscription"));
    }, 4200);
    const tick = setInterval(() => setScannedMinsAgo((v) => (v < 6 ? v + 1 : v)), 5200);
    return () => { clearTimeout(t); clearInterval(cycle); clearInterval(tick); };
  }, []);

  const rows = useMemo(() => {
    const filtered = ROWS.filter((r) => r.kind === tab);
    return filtered.sort((a, b) => a.inDays - b.inDays);
  }, [tab]);

  const monthlySpend = useMemo(() => {
    let inr = 0, usd = 0;
    for (const r of ROWS) {
      if (r.kind !== "subscription") continue;
      const m = r.cadence === "yearly" ? r.amount! / 12 : r.cadence === "quarterly" ? r.amount! / 3 : r.cadence === "weekly" ? r.amount! * 4.345 : r.amount!;
      if (r.currency === "INR") inr += m; else usd += m;
    }
    return { inr, usd };
  }, []);

  if (!ready) {
    return <div className="card h-[430px] animate-pulse" style={{ background: "var(--card)" }} />;
  }

  return (
    <div className="card overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.12)]">
      <div className="px-5 pt-4 pb-3 border-b hairline flex items-center justify-between gap-3">
        <div>
          <div className="micro-label">Your shelf</div>
          <div className="text-[15px] font-medium">perch/you@demo.gmail</div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-[12px] text-[var(--ink-faint)]">
            <span className="scanning-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="scanning-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="scanning-dot inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span className="ml-1">scanned {scannedMinsAgo === 0 ? "just now" : `${scannedMinsAgo}m ago`}</span>
          </div>
          <div className="text-[12px] text-[var(--ink-faint)] mt-0.5">auto-rescan on</div>
        </div>
      </div>

      <div className="px-5 py-4 grid grid-cols-3 gap-3 border-b hairline bg-[color-mix(in_srgb,var(--accent)_4%,transparent)]">
        <Stat label="Monthly spend" value={moneyLabel(monthlySpend.inr, "INR")} sub={`+ ${moneyLabel(monthlySpend.usd, "USD")} / mo`} />
        <Stat label="Renewing soon" value="3" sub="within 10 days" />
        <Stat label="Trials ending" value="1" sub="Notion · 4d" />
      </div>

      <div className="px-5 pb-5">
        <div className="flex gap-5 pt-3 mb-2 text-[13px]">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 -mb-px border-b-2 transition ${tab === t ? "border-[var(--accent)] text-[var(--ink)] font-medium" : "border-transparent text-[var(--ink-faint)] hover:text-[var(--ink-soft)]"}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>
        <ul className="divide-y" style={{ borderColor: "var(--line)" }}>
          {rows.map((r, i) => {
            const refDate = new Date(Date.now() + r.inDays * 864e5).toISOString().slice(0, 10);
            const urg = urgencyFor(r.inDays, refDate);
            return (
              <li key={r.id} className="flex items-center gap-3 py-3 perch-in" style={{ animationDelay: `${i * 70}ms` }}>
                <span
                  className="w-9 h-9 rounded-lg grid place-items-center text-white font-semibold text-[15px] shrink-0"
                  style={{ background: r.accent }}
                >
                  {r.provider[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-medium truncate">{r.provider}</div>
                  <div className="text-[12.5px] text-[var(--ink-faint)] truncate">
                    {r.kind === "event" ? r.where : r.amount !== null ? `${moneyLabel(r.amount, r.currency)} · ${r.cadence}` : "free trial"}
                  </div>
                </div>
                <span className="text-[13px] text-[var(--ink-soft)] tabular-nums shrink-0">{formatRefDate(refDate)}</span>
                <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full tone-${urg.tone} shrink-0`}>{urg.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="text-left">
      <div className="micro-label">{label}</div>
      <div className="stat-num text-[22px] font-semibold leading-tight">{value}</div>
      {sub && <div className="text-[11.5px] text-[var(--ink-faint)] mt-0.5">{sub}</div>}
    </div>
  );
}
