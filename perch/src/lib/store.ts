// ── Storage layer ─────────────────────────────────────────────────────
// Local-first: when BLOB_READ_WRITE_TOKEN is present (Vercel), shelves and
// tokens live in Vercel Blob. Otherwise they live on disk in PERCH_DATA_DIR
// (defaults to ./.perch-data). Swap backends by changing only this file.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Item, Shelf, Settings, Sweep } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/types";

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function dataDir(): string {
  return process.env.PERCH_DATA_DIR || path.join(process.cwd(), ".perch-data");
}

function shelfKey(id: string): string {
  return `perch/shelves/${id}.json`;
}
function tokenKey(id: string): string {
  return `perch/tokens/${id}.json`;
}

// ── Low-level get/put/del over the active backend ─────────────────────

async function readJson<T>(key: string): Promise<T | null> {
  if (useBlob) {
    try {
      const { get } = await import("@vercel/blob");
      const res = await get(key, { access: "private" });
      if (!res || res.statusCode !== 200 || !res.stream) return null;
      const text = await new Response(res.stream).text();
      return JSON.parse(text) as T;
    } catch {
      return null;
    }
  }
  try {
    const p = path.join(/*turbopackIgnore: true*/ dataDir(), key.replace(/\//g, path.sep));
    const raw = await fs.readFile(/*turbopackIgnore: true*/ p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  if (useBlob) {
    const { put } = await import("@vercel/blob");
    await put(key, JSON.stringify(value), { access: "private", addRandomSuffix: false, allowOverwrite: true });
    return;
  }
  const p = path.join(/*turbopackIgnore: true*/ dataDir(), key.replace(/\//g, path.sep));
  await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(p), { recursive: true });
  await fs.writeFile(/*turbopackIgnore: true*/ p, JSON.stringify(value), "utf8");
}

async function removeKey(key: string): Promise<void> {
  if (useBlob) {
    try {
      const { del } = await import("@vercel/blob");
      await del(key);
    } catch {}
    return;
  }
  try { await fs.rm(path.join(/*turbopackIgnore: true*/ dataDir(), key.replace(/\//g, path.sep))); } catch {}
}

// ── Public API (unchanged signatures) ────────────────────────────────

export function shelfIdFor(email: string, provider: string): string {
  return crypto.createHash("sha256").update(`${provider}:${email.toLowerCase()}`).digest("hex").slice(0, 24);
}

export async function loadShelf(id: string): Promise<Shelf | null> {
  return readJson<Shelf>(shelfKey(id));
}

export async function saveShelf(id: string, shelf: Shelf): Promise<void> {
  await writeJson(shelfKey(id), shelf);
}

export async function deleteShelf(id: string): Promise<void> {
  await removeKey(shelfKey(id));
  await removeKey(tokenKey(id));
}

export function tokenPath(id: string): string {
  // Kept for backward compat; returns the storage key.
  return tokenKey(id);
}

interface StoredTokens {
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
}

export async function saveTokens(shelfId: string, t: StoredTokens): Promise<void> {
  const key = tokenKey(shelfId);
  const prev = await readTokensFile(shelfId);
  await writeJson(key, { ...prev, ...t });
}

export async function readTokensFile(shelfId: string): Promise<StoredTokens> {
  return (await readJson<StoredTokens>(tokenKey(shelfId))) ?? {};
}

export async function readRefreshToken(shelfId: string): Promise<string | undefined> {
  return (await readTokensFile(shelfId)).refresh_token;
}

export async function readFreshAccessToken(shelfId: string): Promise<string | null> {
  const t = await readTokensFile(shelfId);
  if (!t.access_token || !t.expires_at) return null;
  if (t.expires_at < Date.now() + 60_000) {
    if (!t.refresh_token) return null;
    const { refreshAccessToken } = await import("@/lib/google");
    try {
      const fresh = await refreshAccessToken(t.refresh_token);
      await saveTokens(shelfId, { access_token: fresh.access_token, expires_at: Date.now() + (fresh.expires_in ?? 3600) * 1000 });
      return fresh.access_token;
    } catch {
      return null;
    }
  }
  return t.access_token;
}

// ── Shelf logic (unchanged) ──────────────────────────────────────────

export interface MergeStats {
  added: string[];
  updated: string[];
}

export function newMergeStats(): MergeStats {
  return { added: [], updated: [] };
}

export function mergeItem(items: Item[], incoming: Item, stats: MergeStats): void {
  const idx = items.findIndex((i) => i.id === incoming.id);
  if (idx === -1) {
    items.push(incoming);
    stats.added.push(incoming.id);
    return;
  }
  const cur = items[idx];
  incoming.firstSeenAt = cur.firstSeenAt && incoming.firstSeenAt ? (cur.firstSeenAt < incoming.firstSeenAt ? cur.firstSeenAt : incoming.firstSeenAt) : (cur.firstSeenAt || incoming.firstSeenAt);
  if (cur.pinned && incoming.nextChargeAt) {
    incoming.nextChargeAt = cur.nextChargeAt;
    incoming.pinned = true;
  }
  incoming.status = cur.status;
  incoming.cancelledAt = cur.cancelledAt;
  incoming.snoozeUntil = cur.snoozeUntil;
  incoming.hints = Array.from(new Set([...(cur.hints ?? []), ...(incoming.hints ?? [])]));
  items[idx] = incoming;
  stats.updated.push(incoming.id);
}

export interface SweepResult {
  items: Item[];
  ended: string[];
  dropped: string[];
}

export function sweep(shelf: Shelf, now = Date.now()): SweepResult {
  const s = shelf.settings ?? DEFAULT_SETTINGS;
  const ended: string[] = [];
  const dropped: string[] = [];
  const kept: Item[] = [];
  const endedItems: Item[] = [];

  for (const item of shelf.items) {
    if (item.status === "ended") { endedItems.push(item); continue; }
    if (item.status === "cancelled") {
      if (item.cancelledAt && now - Date.parse(item.cancelledAt) > s.cancelledDropDays * 864e5) {
        dropped.push(item.id);
      } else kept.push(item);
      continue;
    }
    const endRef = item.trialEndsAt ?? item.nextChargeAt ?? (item.kind === "event" ? item.startsAt : null);
    if (endRef) {
      const endTime = Date.parse(endRef + (endRef.length === 10 ? "T09:00:00Z" : ""));
      if (Number.isFinite(endTime) && now - endTime > (item.kind === "event" ? 1 : s.graceDays) * 864e5) {
        ended.push(item.id);
        endedItems.push({ ...item, hints: Array.from(new Set([...(item.hints ?? []), item.kind === "event" ? "Already happened — archived" : item.trialEndsAt ? "Trial window passed" : "Last known charge has passed"])) });
        continue;
      }
    }
    kept.push(item);
  }

  const survivors: Item[] = [];
  for (const it of endedItems) {
    const ref = it.trialEndsAt ?? it.nextChargeAt ?? it.startsAt ?? it.lastSeenAt;
    const t = Date.parse(ref + (ref.length === 10 ? "T09:00:00Z" : ""));
    if (Number.isFinite(t) && now - t > s.cleanupDays * 864e5) dropped.push(it.id);
    else survivors.push(it);
  }

  return { items: [...kept, ...survivors], ended, dropped };
}

export function normalizeSettings(input: Partial<Settings> | null | undefined): Settings {
  return { ...DEFAULT_SETTINGS, ...(input ?? {}) };
}

export function newSweep(): Sweep {
  return { added: [], updated: [], ended: [], dropped: [] };
}
