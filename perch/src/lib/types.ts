// ── Perch core types ───────────────────────────────────────────────────

export type Kind = "subscription" | "trial" | "event";

export type Status = "active" | "cancelled" | "ended";

export type Cadence = "weekly" | "monthly" | "quarterly" | "yearly" | "unknown";

export interface Item {
  /** Perch-assigned category, e.g. "Entertainment", "Productivity". */
  category?: string;
  /** Stable id: `providerKey` for subscriptions/trials, or message id for events. */
  id: string;
  kind: Kind;
  /** Display name, e.g. "Netflix", "Figma". */
  provider: string;
  /** Slug used for merging scans together, e.g. "netflix". */
  providerKey: string;
  /** Sender email of the most recent supporting email. */
  fromEmail: string;
  /** Hex color used for the letter avatar. */
  accent: string;
  /** Recurring price, when detected. */
  amount: number | null;
  /** ISO 4217 code, e.g. "INR", "USD". */
  currency: string | null;
  cadence: Cadence;
  /** Next renewal / next charge date (ISO yyyy-mm-dd or datetime). */
  nextChargeAt: string | null;
  /** When a free trial ends. */
  trialEndsAt: string | null;
  /** Event start / end (ISO datetime or yyyy-mm-dd; events only). */
  startsAt: string | null;
  endsAt: string | null;
  /** Location / venue for events, when detected. */
 where: string | null;
  /** Last time Perch saw an email supporting this item. */
  lastSeenAt: string;
  firstSeenAt: string;
  emailCount: number;
  lastSubject: string;
  /** Notes Perch computed for the user. */
  hints: string[];
  status: Status;
  cancelledAt: string | null;
  snoozeUntil: string | null;
  /** True when the user manually set the next charge date — scans must not overwrite it. */
  pinned: boolean;
}

export interface Settings {
  /** Days after an end/expiry before an item is moved to "ended". */
  graceDays: number;
  /** Days after "ended" before an item is permanently dropped from the shelf. */
  cleanupDays: number;
  /** Last seen email older than this many days on a paid item → "might be unused". */
  idleDays: number;
  /** Auto-drop cancelled items this many days after the user marked them cancelled. */
  cancelledDropDays: number;
}

export interface Sweep {
  added: string[];
  updated: string[];
  ended: string[];
  dropped: string[];
}

export interface Shelf {
  email: string;
  provider: "google" | "demo";
  settings: Settings;
  items: Item[];
  lastSyncedAt: string | null;
  historyId: string | null;
  sweeps: Sweep[];
}

export const DEFAULT_SETTINGS: Settings = {
  graceDays: 3,
  cleanupDays: 45,
  idleDays: 120,
  cancelledDropDays: 60,
};
