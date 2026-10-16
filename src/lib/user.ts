// Generates or retrieves an anonymous persistent user identity for seamless 1-10 voting and writing

const VOTER_ID_KEY = "tmrh_voter_id";
const USER_HANDLE_KEY = "tmrh_user_handle";
const RECENT_TOPICS_KEY = "tmrh_recent_topics";
const REROLLS_REMAINING_KEY = "tmrh_rerolls_left";

export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anon_default";
  
  let id = localStorage.getItem(VOTER_ID_KEY);
  if (!id) {
    id = "anon_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem(VOTER_ID_KEY, id);
  }
  return id;
}

export function getUserHandle(): string {
  if (typeof window === "undefined") return "curious_mind";
  const handle = localStorage.getItem(USER_HANDLE_KEY);
  if (handle) return handle;

  const animals = ["fox", "crow", "owl", "badger", "lynx", "otter", "hawk", "nomad", "seeker", "turing"];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  const defaultHandle = `${randomAnimal}_${randomNum}`;
  localStorage.setItem(USER_HANDLE_KEY, defaultHandle);
  return defaultHandle;
}

export function saveUserHandle(handle: string): void {
  if (typeof window === "undefined") return;
  const clean = handle.trim().replace(/^@/, "").slice(0, 24);
  if (clean) {
    localStorage.setItem(USER_HANDLE_KEY, clean);
  }
}

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
  // Keep last 10
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
