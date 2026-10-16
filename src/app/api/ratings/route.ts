import { NextResponse } from "next/server";
import { Summary } from "@/types/database";
import { INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";

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
    console.error("Failed to fetch cloud summaries for rating:", err);
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
    console.error("Failed to save cloud summaries for rating:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summaryId, score } = body;
    const numScore = Number(score);

    if (!summaryId || isNaN(numScore) || numScore < 1 || numScore > 10) {
      return NextResponse.json({ success: false, error: "Invalid rating" }, { status: 400 });
    }

    const summaries = await getCloudSummaries();
    let target = summaries.find((s) => s.id === summaryId);

    if (!target) {
      const seedTarget = INITIAL_COMMUNITY_SUMMARIES.find((s) => s.id === summaryId);
      if (seedTarget) {
        target = { ...seedTarget };
        summaries.push(target);
      }
    }

    if (target) {
      const currentCount = target.ratings_count || 0;
      const currentAvg = target.average_score || 0;
      const newCount = currentCount + 1;
      const newAvg = (currentAvg * currentCount + numScore) / newCount;

      target.ratings_count = newCount;
      target.average_score = Number(newAvg.toFixed(1));

      await saveCloudSummaries(summaries);
      return NextResponse.json({
        success: true,
        average_score: target.average_score,
        ratings_count: target.ratings_count,
        user_rating: numScore,
      });
    }

    return NextResponse.json({
      success: true,
      average_score: numScore,
      ratings_count: 1,
      user_rating: numScore,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
