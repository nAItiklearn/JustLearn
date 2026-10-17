/**
 * Anti-Manipulation Cognitive Scoring Engine
 *
 * Designed to prevent leaderboard manipulation:
 * - Replaces infinite linear post bonuses with steep diminishing returns (anti-spam curve)
 * - Caps paper note bonuses to prevent photo dumping
 * - Weights peer marks using logarithmic vote quorum (prevents single-vote manipulation)
 * - Rewards genuine consensus quality over raw volume
 */

export interface LearnerPointsBreakdown {
  totalPoints: number;
  volumePoints: number;
  notesPoints: number;
  peerQualityPoints: number;
}

export function calculateLearnerPoints(params: {
  postsCount: number;
  paperNotesCount: number;
  totalVotesReceived: number;
  averageScore: number;
}): LearnerPointsBreakdown {
  const { postsCount, paperNotesCount, totalVotesReceived, averageScore } = params;

  // 1. Anti-spam diminishing returns on post volume:
  // - 1st to 3rd post: 25 pts each (quick start)
  // - 4th to 6th post: 15 pts each
  // - 7th to 10th post: 8 pts each
  // - 11th+ post: 3 pts each (diminishing, hard ceiling)
  const p1 = Math.min(postsCount, 3) * 25;
  const p2 = Math.min(Math.max(0, postsCount - 3), 3) * 15;
  const p3 = Math.min(Math.max(0, postsCount - 6), 4) * 8;
  const p4 = Math.min(Math.max(0, postsCount - 10), 20) * 3;
  const volumePoints = p1 + p2 + p3 + p4;

  // 2. Physical paper notes (verified effort, capped to prevent image spam)
  const notesPoints = Math.min(paperNotesCount, 5) * 15;

  // 3. Peer Consensus Quality:
  // Quorum weight requires community verification to reach full multiplier
  const quorum = totalVotesReceived > 0 
    ? Math.min(1.0, Math.log10(totalVotesReceived + 1) / Math.log10(15))
    : 0;

  // Quality points scale strongly with high average score (e.g. 9.5 avg -> up to 170 pts)
  const peerQualityPoints = Math.round(averageScore * 18 * quorum);

  const totalPoints = volumePoints + notesPoints + peerQualityPoints;

  return {
    totalPoints,
    volumePoints,
    notesPoints,
    peerQualityPoints,
  };
}
