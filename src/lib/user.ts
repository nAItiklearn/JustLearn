// Generates or retrieves an anonymous persistent user identity for seamless 1-10 voting and writing

const VOTER_ID_KEY = "justlearn_voter_id";
const USER_HANDLE_KEY = "justlearn_user_name";
const LEGACY_HANDLE_KEY = "tmrh_user_handle";
const NAME_LOCKED_KEY = "justlearn_name_locked";
const RECENT_TOPICS_KEY = "justlearn_recent_topics";
const REROLLS_REMAINING_KEY = "justlearn_rerolls_left";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anon_default";
  
  let id = localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = "user_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

export function isNameLocked(): boolean {
  if (typeof window === "undefined") return true;
  const isLocked = localStorage.getItem(NAME_LOCKED_KEY) === "true";
  const name = localStorage.getItem(USER_HANDLE_KEY);
  return Boolean(isLocked && name && name.trim().length > 0);
}

export function getUserHandle(): string {
  if (typeof window === "undefined") return "learner";
  const handle = localStorage.getItem(USER_HANDLE_KEY) || localStorage.getItem(LEGACY_HANDLE_KEY);
  if (handle && handle.trim().length > 0) return handle.trim();
  return "";
}

export function lockUserName(name: string): void {
  if (typeof window === "undefined") return;
  const clean = name.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24);
  if (clean.length > 0) {
    localStorage.setItem(USER_HANDLE_KEY, clean);
    localStorage.setItem(LEGACY_HANDLE_KEY, clean);
    localStorage.setItem(NAME_LOCKED_KEY, "true");
    window.dispatchEvent(new CustomEvent("justlearn_name_locked", { detail: clean }));
  }
}

export const saveUserHandle = lockUserName;

export function getRecentTopicIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_TOPICS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentTopicId(id: string): void {
  if (typeof window === "undefined") return;
  const recent = getRecentTopicIds().filter(x => x !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_TOPICS_KEY, JSON.stringify(recent.slice(0, 10)));
}

export function getRerollsRemaining(): number {
  if (typeof window === "undefined") return 3;
  const raw = sessionStorage.getItem(REROLLS_REMAINING_KEY);
  if (raw === null) {
    sessionStorage.setItem(REROLLS_REMAINING_KEY, "3");
    return 3;
  }
  return parseInt(raw, 10);
}

export function decrementReroll(): number {
  if (typeof window === "undefined") return 0;
  const current = getRerollsRemaining();
  const next = Math.max(0, current - 1);
  sessionStorage.setItem(REROLLS_REMAINING_KEY, next.toString());
  return next;
}

export function resetRerolls(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(REROLLS_REMAINING_KEY, "3");
}
