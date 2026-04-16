/**
 * KNN-based collusion detection
 * Detects pairs of players answering the same way with similar timing
 */

import type { RawAnswerRecord } from "./playerStats";

export interface PlayerAnswerVector {
  playerId: string;
  playerName: string;
  answers: number[]; // answer indices in order
  timings: number[]; // time taken for each answer
  correctCount: number;
}

export interface CollusionPair {
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  similarity: number; // 0-1, higher = more suspicious
  matchedAnswers: number; // count of same answers
  timingSimilarity: number; // 0-1, how close their timing was
  confidence: "low" | "medium" | "high" | "critical";
}

/**
 * Calculate cosine similarity between two vectors
 * Returns 0-1, where 1 = identical
 */
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length === 0 || vec2.length === 0) return 0;

  const minLen = Math.min(vec1.length, vec2.length);
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vec1[i] * vec2[i];
    magnitude1 += vec1[i] * vec1[i];
    magnitude2 += vec2[i] * vec2[i];
  }

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Calculate timing similarity (how close two players answer times are)
 * Returns 0-1, where 1 = identical timing
 */
function calculateTimingSimilarity(
  timings1: number[],
  timings2: number[],
): number {
  const minLen = Math.min(timings1.length, timings2.length);
  if (minLen === 0) return 0;

  let totalDiff = 0;
  for (let i = 0; i < minLen; i++) {
    totalDiff += Math.abs(timings1[i] - timings2[i]);
  }

  const avgDiff = totalDiff / minLen;
  // If avg diff is > 2000ms, similarity drops significantly
  // If < 500ms, very similar
  return Math.max(0, 1 - avgDiff / 3000);
}

/**
 * Detect answer pattern matches (same answers in same sequence)
 */
function calculateAnswerMatchRatio(
  answers1: number[],
  answers2: number[],
): number {
  const minLen = Math.min(answers1.length, answers2.length);
  if (minLen === 0) return 0;

  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (answers1[i] === answers2[i]) matches++;
  }

  return matches / minLen;
}

/**
 * Build answer vector from raw records
 */
export function buildAnswerVector(
  playerId: string,
  playerName: string,
  records: RawAnswerRecord[],
): PlayerAnswerVector {
  return {
    playerId,
    playerName,
    answers: records.map((r) => (r.isCorrect ? 1 : 0)), // Simplified: 1=correct, 0=wrong
    timings: records.map((r) => r.timeTakenMs),
    correctCount: records.filter((r) => r.isCorrect).length,
  };
}

/**
 * KNN collusion detection
 * Compare all pairs of players and flag suspicious pairs
 */
export function detectCollusion(
  playerVectors: PlayerAnswerVector[],
): CollusionPair[] {
  const suspiciousPairs: CollusionPair[] = [];

  // Compare all pairs
  for (let i = 0; i < playerVectors.length; i++) {
    for (let j = i + 1; j < playerVectors.length; j++) {
      const p1 = playerVectors[i];
      const p2 = playerVectors[j];

      // Skip if not enough answers
      if (p1.answers.length < 3 || p2.answers.length < 3) continue;

      const answerMatchRatio = calculateAnswerMatchRatio(
        p1.answers,
        p2.answers,
      );
      const timingSimilarity = calculateTimingSimilarity(
        p1.timings,
        p2.timings,
      );
      const minLen = Math.min(p1.answers.length, p2.answers.length);
      const matchedAnswers = Math.round(answerMatchRatio * minLen);

      // Combine signals: answer matching + timing similarity
      const answerWeight = 0.6; // Answers are stronger signal
      const timingWeight = 0.4;
      const similarity =
        answerMatchRatio * answerWeight + timingSimilarity * timingWeight;

      // Determine confidence level
      let confidence: "low" | "medium" | "high" | "critical" = "low";

      if (similarity > 0.85) {
        confidence = "critical"; // Identical patterns
      } else if (similarity > 0.75) {
        confidence = "high"; // Very suspicious
      } else if (similarity > 0.65) {
        confidence = "medium"; // Somewhat suspicious
      } else if (similarity > 0.5) {
        confidence = "low"; // Possible but weak signal
      }

      // Only flag if similarity is noteworthy
      if (similarity > 0.5) {
        suspiciousPairs.push({
          player1Id: p1.playerId,
          player1Name: p1.playerName,
          player2Id: p2.playerId,
          player2Name: p2.playerName,
          similarity: Math.round(similarity * 100) / 100,
          matchedAnswers,
          timingSimilarity: Math.round(timingSimilarity * 100) / 100,
          confidence,
        });
      }
    }
  }

  // Sort by similarity (highest first)
  return suspiciousPairs.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Generate collusion flag details for logging
 */
export function formatCollusionDetails(pair: CollusionPair): string {
  return `${pair.player1Name} ↔️ ${pair.player2Name}: ${pair.similarity} similarity (${pair.matchedAnswers} matched answers, timing: ${pair.timingSimilarity})`;
}
