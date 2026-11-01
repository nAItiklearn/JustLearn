// ── The scanner: turns a Gmail inbox into shelf items ─────────────────
// One sync = two targeted read-only Gmail searches, then cheap metadata
// reads, then deep text reads only when the metadata is missing money or
// date evidence. Results are classified (subscription / trial / event)
// and merged into the shelf, which keeps user-confirmed facts untouched.

import type { Item, Shelf } from "@/lib/types";
import { merchantFrom, merchantByKey, categoryFor } from "@/lib/merchants";
import { parseEmailText, firstDate, ONE_OFF_KW, EVENT_KW } from "@/lib/parse";
import type { MessageMeta } from "@/lib/google";
import { getMessage, getMessageBody, listMessages } from "@/lib/google";
import type { MergeStats } from "@/lib/store";
import { mergeItem, newMergeStats } from "@/lib/store";

const DAY = 864e5;
const MAX_RESULTS_PER_QUERY = 100;
const DEEP_READ_BUDGET = 25;

const SUB_QUERY =
  '(renew OR renews OR renewal OR recurring OR subscription OR "your plan" OR membership OR billing OR receipt OR invoice OR "next charge" OR "next billing" OR charged OR auto-renew OR "free trial" OR trial)';
const EVENT_QUERY =
  '("your ticket" OR "order confirmed" OR "registration confirmed" OR "you are registered" OR "booking confirmed" OR "reservation" OR "boarding pass" OR "itinerary" OR eventbrite OR "meetup")';

export interface ScanReport {
  ranAt: string;
  messagesSeen: number;
  deepReads: number;
  added: string[];
  updated: string[];
  error?: string;
}

export function emptyScanReport(): ScanReport {
  return { ranAt: "", messagesSeen: 0, deepReads: 0, added: [], updated: [] };
}

export async function runScan(shelf: Shelf, accessToken: string): Promise<ScanReport> {
  const now = Date.now();
  // Incremental by default, but never widen beyond a year and always with a
  // 2-day re-overlap so updated receipts (plan changes, reminders) are seen again.
  const afterMs = shelf.lastSyncedAt
    ? Math.max(Date.parse(shelf.lastSyncedAt) - 2 * DAY, now - 365 * DAY)
    : now - 365 * DAY;
  const afterClause = `after:${gmailDate(afterMs)}`;
  const queries = [
    `${SUB_QUERY} ${afterClause} -in:chats`,
    `${EVENT_QUERY} ${afterClause} -in:chats`,
  ];

  const ids: string[] = [];
  for (const q of queries) {
    try {
      const batch = await listMessages(accessToken, q, MAX_RESULTS_PER_QUERY);
      ids.push(...batch.map((b) => b.id));
    } catch (err) {
      const report = emptyScanReport();
      report.error = err instanceof Error ? err.message : "gmail search failed";
      report.ranAt = new Date().toISOString();
      return report;
    }
  }
  const uniqueIds = Array.from(new Set(ids));
  const stats = newMergeStats();
  let deepReads = 0;

  for (const id of uniqueIds) {
    const meta = await getMessage(accessToken, id);
    if (!meta) continue;
    if (deepReads < DEEP_READ_BUDGET) {
      deepReads++;
      const body = await getMessageBody(accessToken, id);
      considerMessage(shelf.items, stats, meta, body);
    } else {
      considerMessage(shelf.items, stats, meta, null);
    }
  }

  return {
    ranAt: new Date().toISOString(),
    messagesSeen: uniqueIds.length,
    deepReads,
    added: stats.added,
    updated: stats.updated,
  };
}

/** Classify one Gmail message and merge it into the shelf. */
function considerMessage(items: Item[], stats: MergeStats, meta: MessageMeta, body: string | null): void {
  const bareFrom = (meta.headers["from"] ?? "").match(/<([^>]+)>/)?.[1] ?? (meta.headers["from"] ?? "").trim();
  const subject = meta.headers["subject"] ?? "(no subject)";
  const receivedAt = Number(meta.internalDate) || Date.now();
  if (!bareFrom || !bareFrom.includes("@")) return;

  // Noise: newsletters/digests are never receipts unless they also talk money.
  if (/newsletter|digest|round ?up|top \d+ stories?\b/i.test(subject) && !/renew|subscription|trial|billing/i.test(subject)) return;
  if (ONE_OFF_KW.test(subject) && !EVENT_KW.test(subject)) return;

  const merch = merchantFrom(bareFrom, subject, meta.snippet);
  const parsed = parseEmailText(subject, meta.snippet, body ?? undefined, receivedAt);

  // Events are cheap: they only need a date we trust.
  if (parsed.isEvent && !/renew|subscri|trial|billing/i.test(subject)) {
    const provider = eventProviderName(subject, merch.name);
    const startsAt = parsed.startsAt ?? firstDate(`${subject} ${meta.snippet}`, receivedAt) ?? new Date(receivedAt).toISOString().slice(0, 10);
    const item: Item = {
      id: `ev-${merch.key}-${slug(provider)}-${startsAt}`,
      kind: "event",
      provider,
      providerKey: `evt-${slug(provider)}`,
      fromEmail: bareFrom,
      accent: merch.color,
      amount: parsed.amount,
      currency: parsed.currency,
      cadence: "unknown",
      nextChargeAt: null,
      trialEndsAt: null,
      startsAt,
      endsAt: parsed.endsAt,
      where: parsed.where,
      category: "Events",
      firstSeenAt: new Date(receivedAt).toISOString(),
      lastSeenAt: new Date(receivedAt).toISOString(),
      emailCount: 1,
      lastSubject: subject,
      hints: [],
      status: "active",
      cancelledAt: null,
      snoozeUntil: null,
      pinned: false,
    };
    mergeItem(items, item, stats);
    return;
  }

  // Trials: an explicit trial end date is the strongest signal; a trial
  // mention without any money evidence is a soft signal
  const isTrial = Boolean(parsed.trialEndsAt) || (parsed.trialMentioned && parsed.amount === null && parsed.nextChargeAt === null);
  const known = merchantByKey(merch.key);
  const name = known ? known.name : titleize(merch.name);
  const item: Item = {
    id: slug(merch.key),
    kind: isTrial ? "trial" : "subscription",
    provider: name,
    providerKey: slug(merch.key),
    fromEmail: bareFrom,
    accent: merch.color,
    amount: parsed.amount,
    currency: parsed.currency,
    cadence: parsed.cadence,
    category: categoryFor(merch.key),
    nextChargeAt: parsed.nextChargeAt,
    trialEndsAt: parsed.trialEndsAt,
    startsAt: null,
    endsAt: null,
    where: null,
    firstSeenAt: new Date(receivedAt).toISOString(),
    lastSeenAt: new Date(receivedAt).toISOString(),
    emailCount: 1,
    lastSubject: subject,
    hints: parsed.amount !== null && parsed.cadence === "unknown" ? ["Billing schedule isn't visible in the email — set the renewal date yourself if you know it."] : [],
    status: "active",
    cancelledAt: null,
    snoozeUntil: null,
    pinned: false,
  };
  mergeItem(items, item, stats);
}

function gmailDate(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

function eventProviderName(subject: string, fallback: string): string {
  // "Your order confirmed: Rohan's birthday · Aug 3" → keep the informative half.
  const m = subject.match(/^(.{3,64}?)\s*[—–|\-]/);
  const head = m && !/confirmed|ticket|order/i.test(m[1]) ? m[1] : null;
  return titleize(head ?? fallback);
}

function titleize(s: string): string {
  return s.replace(/[^\w &+\-.]/g, "").trim() || "Unknown service";
}

function slug(input: string): string {
  return (input || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "unknown";
}
