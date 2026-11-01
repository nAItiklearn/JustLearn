// ── Snapshot: the dashboard model ─────────────────────────────────────
// Pure functions: turn a shelf + the live time into everything the UI
// needs. The same code powers the API responses and keeps math consistent.

import type { Item, Sweep } from "@/lib/types";

export interface Money {
  currency: string;
  amount: number;
}

export interface Urgency {
  label: string;
  tone: "now" | "soon" | "this-month" | "later" | "pending";
}

export interface RenewalRow {
  item: Item;
  inDays: number | null;
  urgency: Urgency;
  monthlyCost: number | null;
}

export interface Snapshot {
  streakNote: string;
  lastSyncedAt: string | null;
  stats: {
    monthlySpend: Money[];
    activeCount: number;
    trialStatus: { endingSoon: number; watch: number };
    eventCount: number;
    idleCount: number;
    endedCount: number;
    cancelledCount: number;
  };
  renewals: RenewalRow[];
  trials: Array<{ item: Item; inDays: number; urgency: Urgency }>;
  events: Array<{ item: Item; inDays: number; urgency: Urgency }>;
  idle: Array<{ item: Item; monthlyCost: number | null }>;
  ended: Item[];
  cancelled: Item[];
  lastSweep: Sweep | null;
  categories: Array<{ name: string; count: number; monthly: Money[] }>;
}

const DAY = 864e5;

export function buildSnapshot(shelf: { items: Item[]; settings?: { idleDays: number }; lastSyncedAt: string | null; sweeps: Sweep[] }, now = Date.now()): Snapshot {
  const renewals: RenewalRow[] = [];
  const trials: Snapshot["trials"] = [];
  const events: Snapshot["events"] = [];
  const idle: Snapshot["idle"] = [];
  const ended: Item[] = [];
  const cancelled: Item[] = [];
  const byCategory = new Map<string, Item[]>();

  let paidActive = 0;
  void paidActive;
  let trialSoon = 0;
  let trialWatch = 0;
  let eventCount = 0;
  let idleCount = 0;

  for (const item of shelf.items) {
    if (item.status === "ended") {
      ended.push(item);
      continue;
    }
    if (item.status === "cancelled") {
      cancelled.push(item);
      continue;
    }

    const cat = item.category || "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(item);

    if (item.kind === "trial") {
      const inDays = item.trialEndsAt ? Math.round((at(item.trialEndsAt) - now) / DAY) : NaN;
      if (Number.isFinite(inDays)) {
        trials.push({ item, inDays, urgency: urgencyFor(inDays, item.trialEndsAt) });
        if (inDays <= 14) trialWatch++;
        if (inDays <= 5) trialSoon++;
      } else trialWatch++;
      continue;
    }

    if (item.kind === "event") {
      const inDays = item.startsAt ? Math.round((at(item.startsAt) - now) / DAY) : NaN;
      if (Number.isFinite(inDays) && !Number.isNaN(inDays)) {
        events.push({ item, inDays, urgency: urgencyFor(inDays, item.startsAt) });
        eventCount++;
      }
      continue;
    }

    const monthly = monthlyCost(item);
    const inDays = item.nextChargeAt ? Math.round((at(item.nextChargeAt) - now) / DAY) : null;
    renewals.push({ item, inDays, urgency: inDays !== null ? urgencyFor(inDays, item.nextChargeAt) : { label: "no date visible", tone: "pending" }, monthlyCost: monthly });

    const lastSeenOld = (now - Date.parse(item.lastSeenAt)) / DAY;
    if (item.amount !== null && item.amount > 0 && lastSeenOld > (shelf.settings?.idleDays ?? 120)) {
      idle.push({ item, monthlyCost: monthly });
      idleCount++;
    }
  }

  renewals.sort((a, b) => {
    if (a.inDays === null && b.inDays === null) return a.item.provider.localeCompare(b.item.provider);
    if (a.inDays === null) return 1;
    if (b.inDays === null) return -1;
    return a.inDays - b.inDays;
  });
  trials.sort((a, b) => a.inDays - b.inDays);
  events.sort((a, b) => a.inDays - b.inDays);
  ended.sort((a, b) => (a.trialEndsAt ?? a.startsAt ?? "").localeCompare(b.trialEndsAt ?? b.startsAt ?? "")).reverse();
  cancelled.sort((a, b) => (a.cancelledAt ?? "").localeCompare(b.cancelledAt ?? ""));

  const monthlySpend = rollupMonthly(renewals.filter((r) => r.urgency.tone !== "pending" || r.item.amount !== null));
  // priced subs with no visible billing cycle are rolled up as-is — surface that honestly
  const unknownCadence = renewals.filter((r) => r.item.amount !== null && r.item.cadence === "unknown");

  const categories = Array.from(byCategory.entries())
    .map(([name, items]) => {
      const byCur = new Map<string, number>();
      for (const it of items) {
        const m = monthlyCost(it);
        if (m === null) continue;
        const cur = it.currency ?? "USD";
        byCur.set(cur, (byCur.get(cur) ?? 0) + Math.max(m, 0));
      }
      return {
        name,
        count: items.length,
        monthly: Array.from(byCur.entries()).map(([currency, amount]) => ({ currency, amount: Math.round(amount) })),
      };
    })
    .sort((a, b) => {
      const am = a.monthly.reduce((s, m) => s + m.amount, 0);
      const bm = b.monthly.reduce((s, m) => s + m.amount, 0);
      return bm - am;
    });

  const lastSweep = shelf.sweeps && shelf.sweeps.length > 0 ? shelf.sweeps[shelf.sweeps.length - 1] : null;

  return {
    streakNote: spendNote(monthlySpend, unknownCadence),
    lastSyncedAt: shelf.lastSyncedAt,
    stats: {
      monthlySpend,
      activeCount: renewals.length,
      trialStatus: { endingSoon: trialSoon, watch: trialWatch },
      eventCount,
      idleCount,
      endedCount: ended.length,
      cancelledCount: cancelled.length,
    },
    renewals: renewals.filter((r) => r.inDays === null || r.inDays > -7 || r.urgency.tone === "pending"),
    trials,
    events,
    idle,
    ended,
    cancelled,
    lastSweep,
    categories,
  };
}

/** Best-effort monthly-normalized cost, in the item's own currency. */
export function monthlyCost(item: Item): number | null {
  if (item.amount === null) return null;
  switch (item.cadence) {
    case "weekly": return item.amount * 4.345;
    case "quarterly": return item.amount / 3;
    case "yearly": return item.amount / 12;
    case "monthly": return item.amount;
    case "unknown": return item.amount; // assume the email named a single period; flag to user elsewhere
  }
}

function rollupMonthly(rows: RenewalRow[]): Money[] {
  const byCurrency = new Map<string, number>();
  for (const r of rows) {
    const m = r.item.kind === "subscription" ? monthlyCost(r.item) : null;
    if (m === null) continue;
    const cur = r.item.currency ?? "USD";
    byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + Math.max(m, 0));
  }
  return Array.from(byCurrency.entries()).map(([currency, amount]) => ({ currency, amount: Math.round(amount) }));
}

function spendNote(spend: Money[], unknown: RenewalRow[]): string {
  const parts = spend.map((s) => `${moneyLabel(s.amount, s.currency)} / mo`);
  let note = parts.length ? parts.join(" + ") : "no priced subscriptions yet";
  if (unknown.length) note += ` · ${unknown.length} priced plan(s) with unknown billing cycle — counted as-is`;
  return note;
}

export function moneyLabel(amount: number, currency: string | null): string {
  const symbol: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  if (!currency) return `${amount.toFixed(2)}`;
  const sym = symbol[currency] ?? (currency + " ");
  return `${sym}${formatNumber(amount)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
}

export function urgencyFor(inDays: number, refDate: string | null): Urgency {
  if (inDays < 0) return { label: `${Math.abs(inDays)} day${Math.abs(inDays) === 1 ? "" : "s"} behind — verify`, tone: "now" };
  if (inDays === 0) return { label: "today", tone: "now" };
  if (inDays === 1) return { label: "tomorrow", tone: "now" };
  if (inDays <= 3) return { label: `in ${inDays} days`, tone: "now" };
  if (inDays <= 10) return { label: `in ${inDays} days`, tone: "soon" };
  if (inDays <= 30) return { label: `in ${inDays} days`, tone: "this-month" };
  if (inDays <= 90) return { label: `in ${inDays} days`, tone: "later" };
  return { label: formatRefDate(refDate), tone: "later" };
}

export function formatRefDate(ref: string | null): string {
  if (!ref) return "unknown";
  const t = Date.parse(ref + (ref.length === 10 ? "T09:00:00Z" : ""));
  if (!Number.isFinite(t)) return ref;
  return new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: ref.length <= 10 ? "numeric" : undefined });
}

function at(iso: string): number {
  return Date.parse(iso + (iso.length === 10 ? "T09:00:00Z" : ""));
}
