"use client";

import type { Snapshot } from "@/lib/snapshot";
import { moneyLabel } from "@/lib/snapshot";

export function StatStrip({ snapshot }: { snapshot: Snapshot }) {
  const spend = snapshot.stats.monthlySpend;
  const primary = spend[0] ?? { amount: 0, currency: "INR" };
  const secondary = spend.slice(1);
  return (
    <div className="grid sm:grid-cols-4 gap-3 mt-2">
      <Stat label="Monthly spend" value={moneyLabel(primary.amount, primary.currency)} sub={secondary.length ? `+ ${secondary.map((s) => moneyLabel(s.amount, s.currency)).join(", ")}` : "across active plans"} />
      <Stat label="Active plans" value={String(snapshot.stats.activeCount)} sub={snapshot.stats.cancelledCount > 0 ? `${snapshot.stats.cancelledCount} cancelled` : "on the shelf"} />
      <Stat label="Trials ending" value={String(snapshot.stats.trialStatus.endingSoon)} sub={`${snapshot.stats.trialStatus.watch} watching`} />
      <Stat label="Events ahead" value={String(snapshot.stats.eventCount)} sub={`${snapshot.stats.idleCount} maybe unused`} />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-4">
      <div className="micro-label">{label}</div>
      <div className="stat-num text-[26px] font-semibold leading-tight mt-1">{value}</div>
      <div className="text-[11.5px] text-[var(--ink-faint)] mt-1">{sub}</div>
    </div>
  );
}
