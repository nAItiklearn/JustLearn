import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Topic, Summary } from "@/types/database";
import { SEED_TOPICS, INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";
import { getOrCreateUserId } from "@/lib/user";

const LOCAL_SUMMARIES_KEY = "justlearn_local_summaries";
const LOCAL_RATINGS_KEY = "justlearn_local_ratings";

function getLocalSummaries(): Summary[] {
  if (typeof window === "undefined") return INITIAL_COMMUNITY_SUMMARIES;
  try {
    const raw = localStorage.getItem(LOCAL_SUMMARIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_SUMMARIES_KEY, JSON.stringify(INITIAL_COMMUNITY_SUMMARIES));
      return INITIAL_COMMUNITY_SUMMARIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COMMUNITY_SUMMARIES;
  }
}

function saveLocalSummaries(summaries: Summary[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_SUMMARIES_KEY, JSON.stringify(summaries));
}

function getLocalRatings(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_RATINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRating(summaryId: string, score: number): void {
  if (typeof window === "undefined") return;
  const current = getLocalRatings();
  current[summaryId] = score;
  localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(current));
}

export async function fetchTopics(): Promise<Topic[]> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("topics")
          .select("*")
          .order("title");
        if (!error && data && data.length > 0) {
          return data as Topic[];
        }
      } catch (err) {
        console.warn("Supabase fetch topics failed, using fallback seed topics:", err);
      }
    }
  }
  return SEED_TOPICS;
}

export async function fetchSummaries(params: {
  sort?: "top" | "newest";
  category?: string;
  topicId?: string;
}): Promise<Summary[]> {
  const localVotes = getLocalRatings();
  let summaries: Summary[] = [];

  // 1. Try our live centralized cloud API
  try {
    const res = await fetch("/api/summaries", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data?.summaries && Array.isArray(data.summaries)) {
        summaries = data.summaries;
        saveLocalSummaries(summaries);
      }
    }
  } catch {
    // Fall back to local cache
    summaries = getLocalSummaries();
  }

  if (summaries.length === 0) {
    summaries = getLocalSummaries();
  }

  let list = [...summaries];

  if (params.topicId) {
    list = list.filter((s) => s.topic_id === params.topicId);
  }

  if (params.category && params.category !== "All") {
    const topicCategoryMap = new Map(SEED_TOPICS.map((t) => [t.id, t.category]));
    list = list.filter((s) => topicCategoryMap.get(s.topic_id) === params.category);
  }

  if (params.sort === "newest") {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    list.sort((a, b) => {
      if (b.average_score !== a.average_score) {
        return b.average_score - a.average_score;
      }
      return b.ratings_count - a.ratings_count;
    });
  }

  return list.map((item) => ({
    ...item,
    user_rating: localVotes[item.id] || null,
  }));
}

export async function submitSummary(data: {
  topic_id: string;
  topic_title: string;
  author_name: string;
  content: string;
  paper_note_image_url?: string | null;
}): Promise<Summary> {
  const currentUserId = getOrCreateUserId();
  const cleanHandle = (data.author_name || "learner").trim().replace(/^@/, "");

  const newSummary: Summary = {
    id: "sum_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    topic_id: data.topic_id,
    topic_title: data.topic_title,
    author_id: currentUserId,
    author_name: cleanHandle,
    content: data.content,
    paper_note_image_url: data.paper_note_image_url || null,
    average_score: 0,
    ratings_count: 0,
    created_at: new Date().toISOString(),
    user_rating: null,
  };

  // 1. Post to cloud API
  try {
    const res = await fetch("/api/summaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic_id: data.topic_id,
        topic_title: data.topic_title,
        author_name: cleanHandle,
        content: data.content,
        paper_note_image_url: data.paper_note_image_url || null,
        author_id: currentUserId,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.summary) {
        const all = getLocalSummaries();
        saveLocalSummaries([json.summary, ...all]);
        return json.summary;
      }
    }
  } catch (err) {
    console.warn("Cloud summaries save failed, saving to local store:", err);
  }

  // Local fallback
  const all = getLocalSummaries();
  const updated = [newSummary, ...all];
  saveLocalSummaries(updated);
  return newSummary;
}

export async function submitRating(summaryId: string, score: number): Promise<{
  average_score: number;
  ratings_count: number;
  user_rating: number;
}> {
  if (score < 1 || score > 10 || !Number.isInteger(score)) {
    throw new Error("Score must be an integer between 1 and 10.");
  }

  const voterId = getOrCreateUserId();
  saveLocalRating(summaryId, score);

  // 1. Post to cloud API
  try {
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryId, score, voterId }),
    });
    if (res.ok) {
      const json = await res.json();
      return {
        average_score: json.average_score,
        ratings_count: json.ratings_count,
        user_rating: score,
      };
    }
  } catch (err) {
    console.warn("Cloud rating submission failed, saving to local store:", err);
  }

  // Local fallback recalculation
  const all = getLocalSummaries();
  const target = all.find((s) => s.id === summaryId);
  if (target) {
    const newCount = target.ratings_count + 1;
    const newAvg = (target.average_score * target.ratings_count + score) / newCount;
    target.ratings_count = newCount;
    target.average_score = Number(newAvg.toFixed(1));
    saveLocalSummaries(all);
    return {
      average_score: target.average_score,
      ratings_count: target.ratings_count,
      user_rating: score,
    };
  }

  return {
    average_score: score,
    ratings_count: 1,
    user_rating: score,
  };
}
