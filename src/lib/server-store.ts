import { Summary } from "@/types/database";

const CLOUD_SUMMARIES_ID = "ff808181a09d98f701a14624fab675c4";
const CLOUD_USERS_ID = "ff808181a09d98f701a14624fa0075c3";
const DB_BASE = "https://api.restful-api.dev/objects/";

interface GlobalJustLearnStore {
  cachedSummaries?: Summary[];
  lastSummariesFetchTime?: number;
  cachedUsers?: string[];
  lastUsersFetchTime?: number;
}

const g = globalThis as unknown as GlobalJustLearnStore;

export async function getServerSummaries(forceRefresh = false): Promise<Summary[]> {
  const now = Date.now();
  if (!forceRefresh && g.cachedSummaries && g.lastSummariesFetchTime && now - g.lastSummariesFetchTime < 10000) {
    return g.cachedSummaries;
  }

  try {
    const res = await fetch(`${DB_BASE}${CLOUD_SUMMARIES_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.summaries && Array.isArray(json.data.summaries)) {
        const list = json.data.summaries as Summary[];
        g.cachedSummaries = list;
        g.lastSummariesFetchTime = now;
        return list;
      }
    }
  } catch (err) {
    console.error("Failed to fetch cloud summaries:", err);
  }

  return g.cachedSummaries || [];
}

export async function saveServerSummaries(summaries: Summary[]): Promise<boolean> {
  g.cachedSummaries = summaries;
  g.lastSummariesFetchTime = Date.now();

  try {
    const res = await fetch(`${DB_BASE}${CLOUD_SUMMARIES_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "justlearn_summaries_registry_v1",
        data: { summaries },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save cloud summaries:", err);
    return false;
  }
}

export async function getServerUsernames(forceRefresh = false): Promise<string[]> {
  const now = Date.now();
  if (!forceRefresh && g.cachedUsers && g.lastUsersFetchTime && now - g.lastUsersFetchTime < 10000) {
    return g.cachedUsers;
  }

  try {
    const res = await fetch(`${DB_BASE}${CLOUD_USERS_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.usernames && Array.isArray(json.data.usernames)) {
        const names = json.data.usernames as string[];
        g.cachedUsers = names;
        g.lastUsersFetchTime = now;
        return names;
      }
    }
  } catch (err) {
    console.error("Failed to fetch cloud usernames:", err);
  }

  return g.cachedUsers || ["feynman_fellow", "turing_nomad"];
}

export async function saveServerUsernames(usernames: string[]): Promise<boolean> {
  g.cachedUsers = usernames;
  g.lastUsersFetchTime = Date.now();

  try {
    const res = await fetch(`${DB_BASE}${CLOUD_USERS_ID}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "justlearn_users_registry_v1",
        data: { usernames },
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save cloud usernames:", err);
    return false;
  }
}
