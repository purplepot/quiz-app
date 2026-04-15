export interface QuizQuestion {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  timerSec: number;
}

export type QuizPhase =
  | "lobby"
  | "question"
  | "results"
  | "leaderboard"
  | "ended";

export interface ClientIdentity {
  deviceId: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screen: {
    width: number;
    height: number;
  };
}

export interface AnswerTelemetry {
  submittedAt: number;
  timeTakenMs: number;
  tabSwitchCount: number;
  focusedAtSubmit: boolean;
}

export interface QuizMetadata {
  moduleTitle: string;
  status: "scheduled" | "in-progress" | "completed";
}

export interface PlayerSnapshot {
  id: string;
  name: string;
  joinedAt: number;
  score: number;
  suspicionScore: number;
  flags: string[];
}

export interface LeaderboardEntry extends PlayerSnapshot {
  rank: number;
}

export type ClientMessage =
  | {
      type: "join";
      quizCode: string;
      name: string;
      identity: ClientIdentity;
      joinedAt: number;
    }
  | {
      type: "answer";
      questionId: string;
      choiceIndex: number;
      telemetry: AnswerTelemetry;
    }
  | {
      type: "host:create";
      title: string;
      moduleTitle: string;
      questions: QuizQuestion[];
      createdBy: {
        userId: string;
        name: string;
        identity: ClientIdentity;
        createdAt: number;
      };
    }
  | { type: "host:join"; quizCode: string; userId?: string }
  | { type: "host:start"; triggeredAt: number }
  | { type: "host:next"; triggeredAt: number }
  | { type: "host:end"; triggeredAt: number };

export type ServerMessage =
  | {
      type: "joined";
      playerId: string;
      players: PlayerSnapshot[];
      quizId: string;
    }
  | {
      type: "question";
      question: Omit<QuizQuestion, "correctIndex">;
      index: number;
      total: number;
      startedAt: number;
    }
  | { type: "tick"; remaining: number }
  | {
      type: "results";
      questionId: string;
      correctIndex: number;
      distribution: number[];
      scoresByPlayerId: Record<string, number>;
      endedAt: number;
    }
  | { type: "leaderboard"; rankings: LeaderboardEntry[] }
  | { type: "ended"; endedAt: number }
  | { type: "error"; message: string }
  | {
      type: "sync";
      phase: QuizPhase;
      data: {
        quizCode: string;
        quizId: string;
      };
    };
