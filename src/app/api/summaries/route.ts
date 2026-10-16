import { NextResponse } from "next/server";
import { INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";
import { Summary } from "@/types/database";

const CLOUD_SUMMARIES_ID = "ff808181a09d98f701a14624fab675c4";
const DB_BASE = "https://api.restful-api.dev/objects/";

async function getCloudSummaries(): Promise<Summary[]> {
  try {
    const res = await fetch(`${DB_BASE}${CLOUD_SUMMARIES_ID}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.summaries && Array.isArray(json.data.summaries)) {
        return json.data.summaries;
      }
    }
  } catch (err) {
    console.error("Failed to fetch cloud summaries:", err);
  }
  return [];
}

async function saveCloudSummaries(summaries: Summary[]): Promise<boolean> {
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

// GET all summaries
export async function GET() {
  const userSummaries = await getCloudSummaries();
  const existingIds = new Set(userSummaries.map((s) => s.id));
  const missingSeeds = INITIAL_COMMUNITY_SUMMARIES.filter((s) => !existingIds.has(s.id));
  const all = [...userSummaries, ...missingSeeds];
  return NextResponse.json({ summaries: all });
}

// POST a new summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic_id, topic_title, author_name, content, paper_note_image_url, author_id } = body;

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ success: false, error: "Content must be at least 10 words." }, { status: 400 });
    }

    const newSummary: Summary = {
      id: "sum_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      topic_id: topic_id || "custom",
      topic_title: topic_title || "Untitled Topic",
      author_id: author_id || "anon",
      author_name: (author_name || "learner").trim().replace(/^@/, ""),
      content: content.trim(),
      paper_note_image_url: paper_note_image_url || null,
      average_score: 0,
      ratings_count: 0,
      created_at: new Date().toISOString(),
      user_rating: null,
    };

    const existing = await getCloudSummaries();
    const updated = [newSummary, ...existing];
    await saveCloudSummaries(updated);

    return NextResponse.json({ success: true, summary: newSummary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
