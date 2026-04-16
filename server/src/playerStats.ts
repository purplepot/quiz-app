/**
 * Player statistics aggregation and tracking
 * Collects per-answer data to build user-level feature vectors
 */

import type { AnswerTelemetry } from "../../packages/shared-types";

export interface RawAnswerRecord {
  timeTakenMs: number;
  tabSwitchCount: number;
  isCorrect: boolean;
  remainingAtAnswer: number;
  focusedAtSubmit: boolean;
  timestamp: number;
}

/**
 * Tracks all answers for a single player
 * Used to calculate aggregate statistics and detect patterns
 */
export class PlayerAnswerTracker {
  readonly playerId: string;

  private answers: RawAnswerRecord[] = [];

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  /**
   * Record an answer from telemetry
   */
  recordAnswer(
    telemetry: AnswerTelemetry,
    isCorrect: boolean,
    remainingAtAnswer: number,
  ): void {
    this.answers.push({
      timeTakenMs: telemetry.timeTakenMs,
      tabSwitchCount: telemetry.tabSwitchCount,
      isCorrect,
      remainingAtAnswer,
      focusedAtSubmit: telemetry.focusedAtSubmit,
      timestamp: telemetry.submittedAt,
    });
  }

  /**
   * Get all recorded answers
   */
  getAnswers(): RawAnswerRecord[] {
    return [...this.answers];
  }

  /**
   * Calculate aggregate statistics
   */
  getStats() {
    if (this.answers.length === 0) {
      return {
        answerCount: 0,
        correctCount: 0,
        accuracy: 0,
        avgTime: 0,
        stdTime: 0,
        fastCorrectRatio: 0,
        tabSwitchTotal: 0,
        avgRemaining: 0,
      };
    }

    const correctCount = this.answers.filter((a) => a.isCorrect).length;
    const accuracy = correctCount / this.answers.length;

    // Calculate average and std deviation of timing
    const times = this.answers.map((a) => a.timeTakenMs);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const variance =
      times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) /
      times.length;
    const stdTime = Math.sqrt(variance);

    // Fast answers (< 2000ms) that were correct
    const fastCorrectCount = this.answers.filter(
      (a) => a.timeTakenMs < 2000 && a.isCorrect,
    ).length;
    const fastCorrectRatio =
      correctCount > 0 ? fastCorrectCount / correctCount : 0;

    // Total tab switches
    const tabSwitchTotal = this.answers.reduce(
      (sum, a) => sum + a.tabSwitchCount,
      0,
    );

    // Average remaining time at answer
    const avgRemaining =
      this.answers.reduce((sum, a) => sum + a.remainingAtAnswer, 0) /
      this.answers.length;

    return {
      answerCount: this.answers.length,
      correctCount,
      accuracy,
      avgTime: Math.round(avgTime),
      stdTime: Math.round(stdTime),
      fastCorrectRatio: Math.round(fastCorrectRatio * 100) / 100,
      tabSwitchTotal,
      avgRemaining: Math.round(avgRemaining * 10) / 10,
    };
  }

  /**
   * Clear recorded answers (e.g., for next quiz session)
   */
  reset(): void {
    this.answers = [];
  }
}

/**
 * Manages answer tracking for all players in a quiz room
 */
export class QuizAnswerTracking {
  private playerTrackers = new Map<string, PlayerAnswerTracker>();

  /**
   * Get or create tracker for a player
   */
  getPlayerTracker(playerId: string): PlayerAnswerTracker {
    if (!this.playerTrackers.has(playerId)) {
      this.playerTrackers.set(playerId, new PlayerAnswerTracker(playerId));
    }
    return this.playerTrackers.get(playerId)!;
  }

  /**
   * Record an answer for a player
   */
  recordAnswer(
    playerId: string,
    telemetry: AnswerTelemetry,
    isCorrect: boolean,
    remainingAtAnswer: number,
  ): void {
    const tracker = this.getPlayerTracker(playerId);
    tracker.recordAnswer(telemetry, isCorrect, remainingAtAnswer);
  }

  /**
   * Get stats for a specific player
   */
  getPlayerStats(playerId: string) {
    const tracker = this.playerTrackers.get(playerId);
    return tracker
      ? tracker.getStats()
      : {
          answerCount: 0,
          correctCount: 0,
          accuracy: 0,
          avgTime: 0,
          stdTime: 0,
          fastCorrectRatio: 0,
          tabSwitchTotal: 0,
          avgRemaining: 0,
        };
  }

  /**
   * Get all player trackers
   */
  getAllTrackers(): PlayerAnswerTracker[] {
    return Array.from(this.playerTrackers.values());
  }

  /**
   * Clear all tracking data
   */
  reset(): void {
    for (const tracker of this.playerTrackers.values()) {
      tracker.reset();
    }
  }
}
