import WebSocket from "ws";
import type {
  AnswerTelemetry,
  ClientIdentity,
  PlayerSnapshot,
  QuizPhase,
  QuizQuestion,
  ServerMessage,
} from "../../packages/shared-types";
import { quizPersistence } from "./persistence";
import { broadcast, send } from "./utils";

interface Player {
  id: string;
  name: string;
  ws: WebSocket;
  identity: ClientIdentity;
  joinedAt: number;
  suspicionScore: number;
  flags: Set<string>;
}

export class QuizRoom {
  readonly id: string;

  readonly code: string;

  phase: QuizPhase = "lobby";

  hostWs: WebSocket | null = null;

  players: Map<string, Player> = new Map();

  questions: QuizQuestion[] = [];

  title = "";

  currentQuestionIndex = -1;

  answers: Map<string, number> = new Map();

  scores: Map<string, number> = new Map();

  timerId: ReturnType<typeof setInterval> | null = null;

  remaining = 0;

  questionStartedAt = 0;

  constructor(id: string, code: string) {
    this.id = id;
    this.code = code;
  }

  addPlayer(
    name: string,
    ws: WebSocket,
    identity: ClientIdentity,
    joinedAt: number,
  ): string {
    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      name,
      ws,
      identity,
      joinedAt,
      suspicionScore: 0,
      flags: new Set<string>(),
    };

    const sameDeviceOtherName = Array.from(this.players.values()).find(
      (p) => p.identity.deviceId === identity.deviceId && p.name !== name,
    );

    if (sameDeviceOtherName) {
      player.suspicionScore += 2;
      player.flags.add("same_device_multiple_names");
      sameDeviceOtherName.suspicionScore += 2;
      sameDeviceOtherName.flags.add("same_device_multiple_names");
      void quizPersistence
        .updateSuspicion({
          quizId: this.id,
          playerId: sameDeviceOtherName.id,
          suspicionScore: sameDeviceOtherName.suspicionScore,
          flags: Array.from(sameDeviceOtherName.flags),
        })
        .catch((error) =>
          console.error("[Mongo] updateSuspicion failed", error),
        );
    }

    this.players.set(playerId, player);
    this.scores.set(playerId, 0);

    void quizPersistence
      .upsertPlayer({
        quizId: this.id,
        playerId,
        name,
        identity,
        joinedAt,
      })
      .catch((error) => console.error("[Mongo] upsertPlayer failed", error));

    // Increment participant count in quiz
    void quizPersistence
      .incrementParticipantCount(this.id)
      .catch((error) =>
        console.error("[Mongo] incrementParticipantCount failed", error),
      );

    void quizPersistence
      .updateSuspicion({
        quizId: this.id,
        playerId,
        suspicionScore: player.suspicionScore,
        flags: Array.from(player.flags),
      })
      .catch((error) => console.error("[Mongo] updateSuspicion failed", error));

    this.broadcastJoinedState(playerId);

    return playerId;
  }

  start(): void {
    if (this.phase !== "lobby" || this.players.size === 0) return;
    void quizPersistence
      .updatePhase(this.id, "question", Date.now())
      .catch((error) => console.error("[Mongo] updatePhase failed", error));
    this.nextQuestion();
  }

  nextQuestion(): void {
    if (this.timerId) clearInterval(this.timerId);

    this.currentQuestionIndex += 1;

    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard();
      return;
    }

    this.answers.clear();
    this.phase = "question";
    this.questionStartedAt = Date.now();

    const question = this.questions[this.currentQuestionIndex];
    this.remaining = question.timerSec;

    this.broadcastToAll({
      type: "question",
      question: {
        id: question.id,
        text: question.text,
        choices: question.choices,
        timerSec: question.timerSec,
      },
      index: this.currentQuestionIndex,
      total: this.questions.length,
      startedAt: this.questionStartedAt,
    });

    void quizPersistence
      .logEvent(this.id, "question_started", this.questionStartedAt, {
        questionId: question.id,
        questionIndex: this.currentQuestionIndex,
      })
      .catch((error) => console.error("[Mongo] logEvent failed", error));

    this.timerId = setInterval(() => this.tick(), 1000);
  }

  handleAnswer(
    playerId: string,
    questionId: string,
    choiceIndex: number,
    telemetry: AnswerTelemetry,
  ): void {
    if (this.phase !== "question") return;
    if (this.answers.has(playerId)) return;

    const player = this.players.get(playerId);
    if (!player) return;

    const question = this.questions[this.currentQuestionIndex];
    if (question.id !== questionId) {
      player.suspicionScore += 2;
      player.flags.add("answer_for_wrong_question");
      void quizPersistence
        .updateSuspicion({
          quizId: this.id,
          playerId,
          suspicionScore: player.suspicionScore,
          flags: Array.from(player.flags),
        })
        .catch((error) =>
          console.error("[Mongo] updateSuspicion failed", error),
        );
      return;
    }

    const isCorrect = choiceIndex === question.correctIndex;

    this.answers.set(playerId, choiceIndex);

    if (telemetry.timeTakenMs < 600) {
      player.suspicionScore += 1;
      player.flags.add("answer_too_fast");
    }
    if (telemetry.tabSwitchCount > 2) {
      player.suspicionScore += 2;
      player.flags.add("high_tab_switch_count");
    }
    if (telemetry.submittedAt < this.questionStartedAt) {
      player.suspicionScore += 3;
      player.flags.add("invalid_answer_timestamp");
    }
    if (!telemetry.focusedAtSubmit) {
      player.suspicionScore += 1;
      player.flags.add("unfocused_submit");
    }
    if (telemetry.timeTakenMs < 0) {
      player.suspicionScore += 2;
      player.flags.add("negative_answer_time");
    }

    void quizPersistence
      .updateSuspicion({
        quizId: this.id,
        playerId,
        suspicionScore: player.suspicionScore,
        flags: Array.from(player.flags),
      })
      .catch((error) => console.error("[Mongo] updateSuspicion failed", error));

    void quizPersistence
      .recordAnswer({
        quizId: this.id,
        questionId: question.id,
        questionIndex: this.currentQuestionIndex,
        playerId,
        choiceIndex,
        isCorrect,
        submittedAt: telemetry.submittedAt,
        timeTakenMs: telemetry.timeTakenMs,
        tabSwitchCount: telemetry.tabSwitchCount,
        remainingAtAnswer: this.remaining,
      })
      .catch((error) => console.error("[Mongo] recordAnswer failed", error));

    if (isCorrect) {
      const currentScore = this.scores.get(playerId) || 0;
      const points =
        1000 + Math.round(500 * (this.remaining / question.timerSec));
      this.scores.set(playerId, currentScore + points);
    }

    if (this.answers.size === this.players.size) {
      this.timeUp();
    }
  }

  removePlayer(playerId: string): void {
    if (!this.players.has(playerId)) return;

    this.players.delete(playerId);
    this.answers.delete(playerId);
    this.scores.delete(playerId);

    void quizPersistence
      .markPlayerLeft(this.id, playerId, Date.now())
      .catch((error) => console.error("[Mongo] markPlayerLeft failed", error));

    this.broadcastJoinedState(playerId);

    if (this.phase === "question" && this.answers.size === this.players.size) {
      this.timeUp();
    }
  }

  private tick(): void {
    this.remaining -= 1;
    this.broadcastToAll({ type: "tick", remaining: this.remaining });

    if (this.remaining <= 0) {
      this.timeUp();
    }
  }

  private timeUp(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    this.phase = "results";
    void quizPersistence
      .updatePhase(this.id, "results", Date.now())
      .catch((error) => console.error("[Mongo] updatePhase failed", error));

    this.broadcastResults();
  }

  private broadcastResults(): void {
    const question = this.questions[this.currentQuestionIndex];
    const distribution = question.choices.map(
      (_, index) =>
        Array.from(this.answers.values()).filter((answer) => answer === index)
          .length,
    );

    const scoresByPlayerId: Record<string, number> = {};
    this.players.forEach((player) => {
      scoresByPlayerId[player.id] = this.scores.get(player.id) || 0;
    });

    void quizPersistence
      .updateScores(this.id, this.getPlayerSnapshot())
      .catch((error) => console.error("[Mongo] updateScores failed", error));

    this.broadcastToAll({
      type: "results",
      questionId: question.id,
      correctIndex: question.correctIndex,
      distribution,
      scoresByPlayerId,
      endedAt: Date.now(),
    });
  }

  broadcastLeaderboard(): void {
    const rankings = Array.from(this.players.values())
      .map((player) => ({
        id: player.id,
        name: player.name,
        score: this.scores.get(player.id) || 0,
        suspicionScore: player.suspicionScore,
        flags: Array.from(player.flags),
        joinedAt: player.joinedAt,
      }))
      .sort((a, b) => b.score - a.score);

    const ranked = rankings.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    this.phase = "leaderboard";
    void quizPersistence
      .updatePhase(this.id, "leaderboard", Date.now())
      .catch((error) => console.error("[Mongo] updatePhase failed", error));
    void quizPersistence
      .logEvent(this.id, "leaderboard", Date.now(), {
        rankings: ranked,
      })
      .catch((error) => console.error("[Mongo] logEvent failed", error));

    this.broadcastToAll({ type: "leaderboard", rankings: ranked });
  }

  end(): void {
    if (this.timerId) clearInterval(this.timerId);

    this.phase = "ended";
    const endedAt = Date.now();

    void quizPersistence
      .updatePhase(this.id, "ended", endedAt)
      .catch((error) => console.error("[Mongo] updatePhase failed", error));
    void quizPersistence
      .logEvent(this.id, "quiz_ended", endedAt)
      .catch((error) => console.error("[Mongo] logEvent failed", error));

    this.broadcastToAll({ type: "ended", endedAt });
  }

  private broadcastToAll(message: ServerMessage): void {
    if (this.hostWs) send(this.hostWs, message);
    broadcast(
      Array.from(this.players.values()).map((player) => player.ws),
      message,
    );
  }

  private getPlayerSnapshot(): PlayerSnapshot[] {
    return Array.from(this.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      joinedAt: player.joinedAt,
      score: this.scores.get(player.id) || 0,
      suspicionScore: player.suspicionScore,
      flags: Array.from(player.flags),
    }));
  }

  private broadcastJoinedState(changedPlayerId: string): void {
    const players = this.getPlayerSnapshot();
    if (this.hostWs) {
      send(this.hostWs, {
        type: "joined",
        playerId: changedPlayerId,
        players,
        quizId: this.id,
      });
    }

    for (const player of this.players.values()) {
      send(player.ws, {
        type: "joined",
        playerId: player.id,
        players,
        quizId: this.id,
      });
    }
  }
}
