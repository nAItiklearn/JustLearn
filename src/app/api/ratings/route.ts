import { NextResponse } from "next/server";
import { Summary, FeedbackItem } from "@/types/database";
import { INITIAL_COMMUNITY_SUMMARIES } from "@/data/seed-topics";
import { getServerSummaries, saveServerSummaries } from "@/lib/server-store";

function clampScore(val: unknown, fallback: number): number {
  const n = Number(val);
  if (isNaN(n)) return fallback;
  return Math.min(10, Math.max(1, Math.round(n)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summaryId, voterId, voterName, score, accuracy, clarity, completeness, comment, is_correction } = body;

    if (!summaryId) {
      return NextResponse.json({ success: false, error: "Missing summary ID" }, { status: 400 });
    }

    const cleanVoterId = String(voterId || "").trim();
    if (!cleanVoterId) {
      return NextResponse.json({ success: false, error: "Valid voter ID required to rate." }, { status: 400 });
    }

    const cleanVoterName = String(voterName || "peer_learner").trim().replace(/^@/, "");

    // Validate 3 criteria scores on server
    const baseScore = clampScore(score, 8);
    const acc = accuracy !== undefined ? clampScore(accuracy, baseScore) : baseScore;
    const cla = clarity !== undefined ? clampScore(clarity, baseScore) : baseScore;
    const com = completeness !== undefined ? clampScore(completeness, baseScore) : baseScore;
    const overallScore = Number(((acc + cla + com) / 3).toFixed(1));

    let summaries = await getServerSummaries();
    let target = summaries.find((s) => s.id === summaryId);

    if (!target) {
      summaries = await getServerSummaries(true);
      target = summaries.find((s) => s.id === summaryId);
    }

    if (!target) {
      const seedTarget = INITIAL_COMMUNITY_SUMMARIES.find((s) => s.id === summaryId);
      if (seedTarget) {
        target = { ...seedTarget };
        summaries.push(target);
      }
    }

    if (!target) {
      return NextResponse.json({ success: false, error: "Synthesis not found" }, { status: 404 });
    }

    // 1. Prevent self-voting: authors cannot rate their own synthesis
    if (
      target.author_id === cleanVoterId ||
      target.author_name.toLowerCase() === cleanVoterName.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Self-rating is prohibited. Only fellow peer learners can rate your synthesis." },
        { status: 403 }
      );
    }

    // Ensure collections exist
    if (!target.voter_ids) target.voter_ids = [];
    if (!target.feedback_items) target.feedback_items = [];

    // 2. Enforce one vote per eligible user: check if already voted
    const existingFeedbackIndex = target.feedback_items.findIndex((fb) => fb.voter_id === cleanVoterId);
    const hasAlreadyVoted = target.voter_ids.includes(cleanVoterId) || existingFeedbackIndex !== -1;

    const feedbackEntry: FeedbackItem = {
      id: "fb_" + Math.random().toString(36).substring(2, 9),
      voter_id: cleanVoterId,
      voter_name: cleanVoterName,
      accuracy: acc,
      clarity: cla,
      completeness: com,
      overall: overallScore,
      comment: comment ? String(comment).trim().slice(0, 500) : undefined,
      is_correction: Boolean(is_correction),
      created_at: new Date().toISOString(),
    };

    if (hasAlreadyVoted) {
      // Update their existing review without inflating ratings count
      if (existingFeedbackIndex !== -1) {
        target.feedback_items[existingFeedbackIndex] = feedbackEntry;
      } else {
        target.feedback_items.unshift(feedbackEntry);
      }
    } else {
      // New unique voter
      target.voter_ids.push(cleanVoterId);
      target.feedback_items.unshift(feedbackEntry);
      target.ratings_count = (target.ratings_count || 0) + 1;
    }

    // Recalculate robust server-side averages across all feedback items
    if (target.feedback_items.length > 0) {
      const totalOverall = target.feedback_items.reduce((sum, fb) => sum + fb.overall, 0);
      const totalAcc = target.feedback_items.reduce((sum, fb) => sum + fb.accuracy, 0);
      const totalCla = target.feedback_items.reduce((sum, fb) => sum + fb.clarity, 0);
      const totalCom = target.feedback_items.reduce((sum, fb) => sum + fb.completeness, 0);
      const count = target.feedback_items.length;

      target.average_score = Number((totalOverall / count).toFixed(1));
      target.accuracy_avg = Number((totalAcc / count).toFixed(1));
      target.clarity_avg = Number((totalCla / count).toFixed(1));
      target.completeness_avg = Number((totalCom / count).toFixed(1));
      target.ratings_count = Math.max(target.ratings_count, count);
    } else {
      target.average_score = overallScore;
      target.accuracy_avg = acc;
      target.clarity_avg = cla;
      target.completeness_avg = com;
    }

    await saveServerSummaries(summaries);

    return NextResponse.json({
      success: true,
      average_score: target.average_score,
      ratings_count: target.ratings_count,
      accuracy_avg: target.accuracy_avg,
      clarity_avg: target.clarity_avg,
      completeness_avg: target.completeness_avg,
      user_rating: overallScore,
      user_feedback: feedbackEntry,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
