// ── Demo shelf: a realistic simulation so anyone can see the product
// before connecting Gmail. Dates are computed relative to "now" each time
// a demo shelf is created.

import { categoryFor } from "@/lib/merchants";
import type { Item, Shelf } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

const DAY = 864e5;

interface DemoSeed {
  id: string;
  kind: Item["kind"];
  provider: string;
  fromEmail: string;
  accent: string;
  amount: number | null;
  currency: string | null;
  cadence: Item["cadence"];
  /** days until next charge / trial end / event start */
  inDays: number;
  emailCount: number;
  lastSeenDaysAgo: number;
  status?: Item["status"];
  hints?: string[];
  where?: string | null;
}

function iso(offsetDays: number, hour = 0): string {
  return new Date(Date.now() + offsetDays * DAY + hour * 36e5).toISOString();
}
function day(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);
}

const SEEDS: DemoSeed[] = [
  { id: "demo-figma", kind: "subscription", provider: "Figma", fromEmail: "no-reply@figma.com", accent: "#a259ff", amount: 3250, currency: "INR", cadence: "yearly", inDays: 2, emailCount: 11, lastSeenDaysAgo: 340, status: "active", hints: [] },
  { id: "demo-netflix", kind: "subscription", provider: "Netflix", fromEmail: "noreply@netflix.com", accent: "#b1060f", amount: 649, currency: "INR", cadence: "monthly", inDays: 6, emailCount: 23, lastSeenDaysAgo: 24, hints: [] },
  { id: "demo-openai", kind: "subscription", provider: "ChatGPT Plus", fromEmail: "noreply@openai.com", accent: "#10a37f", amount: 20, currency: "USD", cadence: "monthly", inDays: 11, emailCount: 9, lastSeenDaysAgo: 19, hints: [] },
  { id: "demo-canva", kind: "subscription", provider: "Canva Pro", fromEmail: "no-reply@canva.com", accent: "#00c4cc", amount: 3999, currency: "INR", cadence: "yearly", inDays: 148, emailCount: 6, lastSeenDaysAgo: 212, status: "active", hints: [] },
  { id: "demo-swiggy", kind: "subscription", provider: "Swiggy One", fromEmail: "no-reply@app CORPORATE.swiggy.com", accent: "#fc8019", amount: 799, currency: "INR", cadence: "quarterly", inDays: 19, emailCount: 4, lastSeenDaysAgo: 71, hints: ["Renewed last quarter without you opening the app?"] },
  { id: "demo-grammarly", kind: "subscription", provider: "Grammarly", fromEmail: "send@grammarly.com", accent: "#15c39a", amount: 12, currency: "USD", cadence: "monthly", inDays: 3, emailCount: 14, lastSeenDaysAgo: 250, hints: [] },
  { id: "demo-crunchyroll", kind: "subscription", provider: "Crunchyroll", fromEmail: "no-reply@crunchyroll.com", accent: "#f47521", amount: 999, currency: "INR", cadence: "monthly", inDays: 42, emailCount: 8, lastSeenDaysAgo: 118, status: "active", hints: [] },
  { id: "demo-notion", kind: "trial", provider: "Notion (work plan)", fromEmail: "team@makenotion.com", accent: "#111111", amount: null, currency: "INR", cadence: "monthly", inDays: 4, emailCount: 5, lastSeenDaysAgo: 1 },
  { id: "demo-github", kind: "trial", provider: "GitHub Copilot", fromEmail: "noreply@github.com", accent: "#181717", amount: null, currency: null, cadence: "monthly", inDays: 12, emailCount: 3, lastSeenDaysAgo: 18 },
  { id: "demo-adobe", kind: "trial", provider: "Adobe Firefly", fromEmail: "noreply@adobe.com", accent: "#ff0000", amount: null, currency: null, cadence: "monthly", inDays: 27, emailCount: 4, lastSeenDaysAgo: 3 },
  { id: "demo-event-dj", kind: "event", provider: "Sunburn Reload, Pune", fromEmail: "order@eventbrite.com", accent: "#f05537", amount: 2500, currency: "INR", cadence: "unknown", inDays: 8, emailCount: 2, lastSeenDaysAgo: 18, where: "Fountain Square, MG Road" },
  { id: "demo-event-meetup", kind: "event", provider: "JSConf India — day pass", fromEmail: "notifications@jsconf.in", accent: "#0a66c2", amount: 0, currency: "INR", cadence: "unknown", inDays: 15, emailCount: 3, lastSeenDaysAgo: 24, where: "online · Zoom webinar" },
  { id: "demo-old-domains", kind: "subscription", provider: "Old cloud host", fromEmail: "billing@oldhost.io", accent: "hsl(12 62% 42%)", amount: 144, currency: "USD", cadence: "yearly", inDays: 190, emailCount: 7, lastSeenDaysAgo: 285, status: "cancelled", hints: [] },
  { id: "demo-xbox", kind: "subscription", provider: "Xbox Game Pass", fromEmail: "noreply@xbox.com", accent: "#107c10", amount: 499, currency: "INR", cadence: "monthly", inDays: 9, emailCount: 6, lastSeenDaysAgo: 21, status: "ended", hints: [] },
];

export function buildDemoShelf(email: string): Shelf {
  const items: Item[] = SEEDS.map((s) => ({
    id: s.id,
    kind: s.kind,
    provider: s.provider,
    providerKey: s.id.replace("demo-", ""),
    fromEmail: s.fromEmail,
    accent: s.accent,
    amount: s.amount,
    currency: s.currency,
    cadence: s.cadence,
    category: s.kind === "event" ? "Events" : categoryFor(s.id.replace("demo-", "")),
    nextChargeAt: s.kind === "subscription" ? day(s.inDays) : null,
    trialEndsAt: s.kind === "trial" ? day(s.inDays) : null,
    startsAt: s.kind === "event" ? iso(s.inDays, 18) : null,
    endsAt: null,
    where: s.where ?? null,
    lastSeenAt: iso(-s.lastSeenDaysAgo),
    firstSeenAt: iso(-s.lastSeenDaysAgo - 30 * s.emailCount),
    emailCount: s.emailCount,
    lastSubject: lastSubjectFor(s),
    hints: s.hints ?? [],
    status: s.status ?? "active",
    cancelledAt: s.status === "cancelled" ? iso(-5) : null,
    snoozeUntil: null,
    pinned: false,
  }));
  return {
    email: email || "you@demo.gmail",
    provider: "demo",
    settings: { ...DEFAULT_SETTINGS },
    items,
    lastSyncedAt: new Date().toISOString(),
    historyId: null,
    sweeps: [],
  };
}

function lastSubjectFor(s: DemoSeed): string {
  if (s.kind === "subscription") return `Your ${s.provider} plan renews on `;
  if (s.kind === "trial") return `Your free trial of ${s.provider} ends in`;
  return `Your registration is confirmed — see you at ${s.provider}`;
}
