import { NextResponse } from "next/server";
import { INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";
import { Summary } from "@/types/database";
import { getServerSummaries, saveServerSummaries } from "@/lib/server-store";

// GET all summaries
export async function GET() {
  const userSummaries = await getServerSummaries();
  const existingIds = new Set(userSummaries.map((s) => s.id));
  const missingSeeds = INITIAL_COMMUNITY_SUMMARIES.filter((s) => !existingIds.has(s.id));
  const all = [...userSummaries, ...missingSeeds];
  return NextResponse.json({ summaries: all });
}

const authorSubmissionTimestamps = new Map<string, number>();

// POST a new summary
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic_id, topic_title, author_name, content, paper_note_image_url, author_id } = body;

    const cleanAuthor = String(author_name || "learner").trim().replace(/^@/, "").slice(0, 30);
    const cleanAuthorId = String(author_id || "anon").trim();

    // 1. In-memory & Cloud Rate-Limiting Cooldown (minimum 45 seconds between posts)
    const now = Date.now();
    const lastAuthorTime =
      authorSubmissionTimestamps.get(cleanAuthorId) ||
      authorSubmissionTimestamps.get(cleanAuthor.toLowerCase());

    if (lastAuthorTime && now - lastAuthorTime < 45 * 1000) {
      const waitSec = Math.ceil((45 * 1000 - (now - lastAuthorTime)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Submission cooldown active. High-quality cognitive synthesis takes reflection. Please wait ${waitSec}s before posting another topic.`,
        },
        { status: 429 }
      );
    }

    const existing = await getServerSummaries();

    const recentByAuthor = existing.find(
      (s) =>
        (s.author_id === cleanAuthorId || s.author_name.toLowerCase() === cleanAuthor.toLowerCase()) &&
        now - new Date(s.created_at).getTime() < 45 * 1000
    );

    if (recentByAuthor) {
      const waitSec = Math.ceil((45 * 1000 - (now - new Date(recentByAuthor.created_at).getTime())) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Submission cooldown active. High-quality cognitive synthesis takes reflection. Please wait ${waitSec}s before posting another topic.`,
        },
        { status: 429 }
      );
    }

    const trimmedContent = (content || "").trim();
    const words = trimmedContent.split(/\s+/).filter(Boolean);
    if (words.length < 15) {
      return NextResponse.json(
        { success: false, error: "Synthesis must be at least 15 words to explain the concept properly." },
        { status: 400 }
      );
    }

    // 2. Duplicate detection: prevent exact duplicate submissions
    const isDuplicate = existing.some(
      (s) =>
        s.author_id === cleanAuthorId &&
        s.topic_id === topic_id &&
        s.content.trim().toLowerCase() === trimmedContent.toLowerCase()
    );

    if (isDuplicate) {
      return NextResponse.json(
        { success: false, error: "You have already published this exact synthesis for this topic." },
        { status: 409 }
      );
    }

    const newSummary: Summary = {
      id: "sum_" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      topic_id: topic_id || "custom",
      topic_title: topic_title || "Untitled Topic",
      author_id: cleanAuthorId,
      author_name: cleanAuthor,
      content: trimmedContent,
      paper_note_image_url: paper_note_image_url || null,
      average_score: 0,
      ratings_count: 0,
      accuracy_avg: 0,
      clarity_avg: 0,
      completeness_avg: 0,
      feedback_items: [],
      voter_ids: [],
      created_at: new Date().toISOString(),
      user_rating: null,
    };

    const updated = [newSummary, ...existing];
    await saveServerSummaries(updated);

    // Record submission timestamp for instant in-process rate limiting
    authorSubmissionTimestamps.set(cleanAuthorId, now);
    authorSubmissionTimestamps.set(cleanAuthor.toLowerCase(), now);

    return NextResponse.json({ success: true, summary: newSummary });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
