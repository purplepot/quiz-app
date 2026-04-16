/**
 * Rule-based suspicion scoring system
 * Detects potential cheating based on answer telemetry
 */

export interface AnswerData {
  timeTakenMs: number;
  tabSwitchCount: number;
  isCorrect: boolean;
  remainingAtAnswer: number;
  focusedAtSubmit: boolean;
}

export interface PlayerStats {
  avgTime: number;
  stdTime: number;
  accuracy: number;
  fastCorrectRatio: number;
  tabSwitchTotal: number;
  avgRemaining: number;
  answerCount: number;
  correctCount: number;
}

/**
 * Calculate suspicion score for a single answer (0-1 scale)
 * Higher = more suspicious
 */
export function getAnswerSuspicionScore(data: AnswerData): number {
  let score = 0;

  // 1. Too fast answers (< 2 seconds)
  if (data.timeTakenMs < 2000) {
    score += 0.3;
  }

  // 2. Tab switching (0.2 per switch, max 0.6)
  score += Math.min(data.tabSwitchCount * 0.2, 0.6);

  // 3. Very early answer (remaining time > 10 seconds)
  if (data.remainingAtAnswer > 10) {
    score += 0.2;
  }

  // 4. Fast + correct = suspicious pattern
  if (data.timeTakenMs < 2000 && data.isCorrect) {
    score += 0.3;
  }

  // 5. Not focused at submit
  if (!data.focusedAtSubmit) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

/**
 * Calculate suspicion score based on aggregate player statistics
 * Detects patterns like "perfect score with impossibly fast timing"
 */
export function getAggregatePlayerSuspicionScore(stats: PlayerStats): number {
  if (stats.answerCount === 0) return 0;

  let suspicion = 0;

  // Pattern 1: Perfect or near-perfect accuracy with very fast times
  if (stats.accuracy > 0.85 && stats.avgTime < 2000) {
    suspicion += 0.4;
  }

  // Pattern 2: High fast-correct ratio (getting right answers too quickly)
  if (stats.fastCorrectRatio > 0.7) {
    suspicion += 0.3;
  }

  // Pattern 3: Very high tab switching
  if (stats.tabSwitchTotal > stats.answerCount * 2) {
    suspicion += 0.2;
  }

  // Pattern 4: Answers too early in timer (high remaining time)
  if (stats.avgRemaining > 15) {
    suspicion += 0.2;
  }

  // Pattern 5: Extremely low variance in timing (too consistent)
  if (stats.stdTime < 500 && stats.avgTime < 3000 && stats.answerCount > 3) {
    suspicion += 0.3;
  }

  return Math.min(suspicion, 1);
}

/**
 * Determine if answer should trigger immediate flag
 */
export function shouldFlagAnswerImmediately(answerScore: number): boolean {
  return answerScore > 0.7;
}

/**
 * Determine if player should be flagged based on aggregate stats
 */
export function shouldFlagPlayerAggregate(aggregateScore: number): boolean {
  return aggregateScore > 0.6;
}

/**
 * Convert numeric score to severity level
 */
export function getSeverityLevel(
  score: number,
): "low" | "medium" | "high" | "critical" {
  if (score < 0.3) return "low";
  if (score < 0.6) return "medium";
  if (score < 0.8) return "high";
  return "critical";
}
