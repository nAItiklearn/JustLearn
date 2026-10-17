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

  const currentUserId = typeof window !== "undefined" ? getOrCreateUserId() : "";
  return list.map((item) => {
    const myFeedback = item.feedback_items?.find((fb) => fb.voter_id === currentUserId);
    return {
      ...item,
      user_rating: myFeedback?.overall || localVotes[item.id] || null,
      user_feedback: myFeedback || null,
    };
  });
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
    } else {
      const errorJson = await res.json().catch(() => null);
      if (errorJson?.error) {
        throw new Error(errorJson.error);
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message) {
      throw err;
    }
    console.warn("Cloud summaries save failed, saving to local store:", err);
  }

  // Local fallback
  const all = getLocalSummaries();
  const updated = [newSummary, ...all];
  saveLocalSummaries(updated);
  return newSummary;
}

export interface SubmitRatingOptions {
  summaryId: string;
  score?: number;
  accuracy?: number;
  clarity?: number;
  completeness?: number;
  comment?: string;
  isCorrection?: boolean;
}

export async function submitRating(
  param1: string | SubmitRatingOptions,
  param2?: number
): Promise<{
  average_score: number;
  ratings_count: number;
  accuracy_avg?: number;
  clarity_avg?: number;
  completeness_avg?: number;
  user_rating: number;
}> {
  const options: SubmitRatingOptions =
    typeof param1 === "string"
      ? { summaryId: param1, score: param2 ?? 8 }
      : param1;

  const score = options.score ?? Math.round(((options.accuracy ?? 8) + (options.clarity ?? 8) + (options.completeness ?? 8)) / 3);
  const voterId = getOrCreateUserId();
  const voterName = (typeof window !== "undefined" ? localStorage.getItem("justlearn_user_name") : null) || "peer_learner";

  saveLocalRating(options.summaryId, score);

  // 1. Post to cloud API
  try {
    const res = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summaryId: options.summaryId,
        score,
        accuracy: options.accuracy,
        clarity: options.clarity,
        completeness: options.completeness,
        comment: options.comment,
        is_correction: options.isCorrection,
        voterId,
        voterName,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return {
        average_score: json.average_score,
        ratings_count: json.ratings_count,
        accuracy_avg: json.accuracy_avg,
        clarity_avg: json.clarity_avg,
        completeness_avg: json.completeness_avg,
        user_rating: json.user_rating || score,
      };
    } else {
      const errorJson = await res.json().catch(() => null);
      if (errorJson?.error) {
        throw new Error(errorJson.error);
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message) {
      throw err;
    }
    console.warn("Cloud rating submission failed, saving to local store:", err);
  }

  // Local fallback recalculation
  const all = getLocalSummaries();
  const target = all.find((s) => s.id === options.summaryId);
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
