// ── Signed session cookie (no external auth dependency) ───────────────

import crypto from "crypto";
import { cookies } from "next/headers";

export interface Session {
  email: string;
  provider: "google" | "demo";
  shelfId: string;
}

const COOKIE = "perch_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.PERCH_SESSION_SECRET || "perch-dev-secret-change-me";
}

export function shelfIdForSession(email: string, provider: "google" | "demo"): string {
  return crypto.createHash("sha256").update(`${provider}:${email.toLowerCase()}`).digest("hex").slice(0, 24);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(s: Session): string {
  const payload = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(v: string | undefined): Session | null {
  if (!v) return null;
  const [payload, sig] = v.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof parsed?.email === "string" && (parsed?.provider === "google" || parsed?.provider === "demo")) {
      return { email: parsed.email, provider: parsed.provider, shelfId: shelfIdForSession(parsed.email, parsed.provider) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE)?.value);
}

export function requireShelfId(session: Session): string {
  return session.shelfId ?? shelfIdForSession(session.email, session.provider);
}
