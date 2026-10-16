import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Topic, Summary, Rating } from "@/types/database";
import { SEED_TOPICS, INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";
import { getOrCreateUserId } from "@/lib/user";

const LOCAL_SUMMARIES_KEY = "tmrh_local_summaries";
const LOCAL_RATINGS_KEY = "tmrh_local_ratings";

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
  // Map of summary_id -> score for current voter
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
  const currentUserId = getOrCreateUserId();

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        let query = supabase.from("summaries").select("*");

        if (params.topicId) {
          query = query.eq("topic_id", params.topicId);
        }

        if (params.sort === "top") {
          query = query.order("average_score", { ascending: false }).order("ratings_count", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (!error && data) {
          // Also fetch user's own ratings to highlight them
          const summaryIds = data.map((s) => s.id);
          let userRatingsMap: Record<string, number> = {};

          if (summaryIds.length > 0) {
            const { data: userRatings } = await supabase
              .from("ratings")
              .select("summary_id, score")
              .eq("voter_id", currentUserId)
              .in("summary_id", summaryIds);

            if (userRatings) {
              userRatings.forEach((r: { summary_id: string; score: number }) => {
                userRatingsMap[r.summary_id] = r.score;
              });
            }
          }

          let items: Summary[] = data.map((item) => ({
            ...item,
            average_score: Number(item.average_score) || 0,
            ratings_count: Number(item.ratings_count) || 0,
            user_rating: userRatingsMap[item.id] || null,
          }));

          // Client-side category filtering if topic is matched
          if (params.category && params.category !== "All") {
            const topicCategoryMap = new Map(SEED_TOPICS.map((t) => [t.id, t.category]));
            items = items.filter((item) => {
              const cat = topicCategoryMap.get(item.topic_id);
              return cat === params.category;
            });
          }

          return items;
        }
      } catch (err) {
        console.warn("Supabase fetch summaries failed, falling back to local storage:", err);
      }
    }
  }

  // Local fallback
  let list = getLocalSummaries();
  const localVotes = getLocalRatings();

  if (params.topicId) {
    list = list.filter((s) => s.topic_id === params.topicId);
  }

  if (params.category && params.category !== "All") {
    const topicCategoryMap = new Map(SEED_TOPICS.map((t) => [t.id, t.category]));
    list = list.filter((s) => topicCategoryMap.get(s.topic_id) === params.category);
  }

  if (params.sort === "newest") {
    list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    list = [...list].sort((a, b) => {
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
  const newSummary: Summary = {
    id: "sum_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    topic_id: data.topic_id,
    topic_title: data.topic_title,
    author_id: currentUserId,
    author_name: data.author_name || "curious_mind",
    content: data.content,
    paper_note_image_url: data.paper_note_image_url || null,
    average_score: 0,
    ratings_count: 0,
    created_at: new Date().toISOString(),
    user_rating: null,
  };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        const { data: inserted, error } = await supabase
          .from("summaries")
          .insert({
            topic_id: data.topic_id.includes("-") ? data.topic_id : null,
            topic_title: data.topic_title,
            author_id: currentUserId,
            author_name: data.author_name,
            content: data.content,
            paper_note_image_url: data.paper_note_image_url || null,
            average_score: 0,
            ratings_count: 0,
          })
          .select()
          .single();

        if (!error && inserted) {
          // Increment completed counter on topics
          if (data.topic_id.includes("-")) {
            try {
              await supabase.rpc("increment_topic_completed", { topic_uuid: data.topic_id });
            } catch {
              // ignore if RPC not configured on remote
            }
          }
          return {
            ...inserted,
            average_score: Number(inserted.average_score) || 0,
            ratings_count: Number(inserted.ratings_count) || 0,
            user_rating: null,
          };
        }
      } catch (err) {
        console.warn("Supabase insert summary failed, saving to local store:", err);
      }
    }
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

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    if (supabase) {
      try {
        // Upsert rating (replaces vote if already exists for this voter & summary)
        const { error: ratingError } = await supabase
          .from("ratings")
          .upsert(
            {
              summary_id: summaryId,
              voter_id: voterId,
              score: score,
            },
            { onConflict: "summary_id, voter_id" }
          );

        if (!ratingError) {
          // Read updated summary metrics (calculated by PostgreSQL trigger or manual fallback)
          const { data: summaryData } = await supabase
            .from("summaries")
            .select("average_score, ratings_count")
            .eq("id", summaryId)
            .single();

          if (summaryData) {
            return {
              average_score: Number(summaryData.average_score) || score,
              ratings_count: Number(summaryData.ratings_count) || 1,
              user_rating: score,
            };
          }
        }
      } catch (err) {
        console.warn("Supabase submit rating error, falling back to local calculation:", err);
      }
    }
  }

  // Local calculation & persistence
  saveLocalRating(summaryId, score);
  const all = getLocalSummaries();
  let newAvg = score;
  let newCount = 1;

  const targetIndex = all.findIndex((s) => s.id === summaryId);
  if (targetIndex !== -1) {
    const item = all[targetIndex];
    const prevScore = item.user_rating;
    if (prevScore) {
      // Voter is updating an existing vote
      const totalPoints = item.average_score * item.ratings_count - prevScore + score;
      newCount = item.ratings_count;
      newAvg = Math.round((totalPoints / Math.max(1, newCount)) * 10) / 10;
    } else {
      // New vote
      const totalPoints = item.average_score * item.ratings_count + score;
      newCount = item.ratings_count + 1;
      newAvg = Math.round((totalPoints / newCount) * 10) / 10;
    }
    item.average_score = newAvg;
    item.ratings_count = newCount;
    item.user_rating = score;
    saveLocalSummaries(all);
  }

  return {
    average_score: newAvg,
    ratings_count: newCount,
    user_rating: score,
  };
}
