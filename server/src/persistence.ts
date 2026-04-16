import { MongoClient } from "mongodb";
import type {
  ClientIdentity,
  PlayerSnapshot,
  QuizPhase,
  QuizQuestion,
} from "../../packages/shared-types";

type QuizEventType =
  | "host_start"
  | "host_next"
  | "host_end"
  | "question_started"
  | "leaderboard"
  | "quiz_ended";

export interface User {
  _id?: string;
  userId: string;
  email: string;
  name: string;
  passwordHash: string;
  role: "organizer" | "participant";
  createdAt: number;
  updatedAt: number;
}

interface CreateQuizPayload {
  quizId: string;
  code: string;
  title: string;
  moduleTitle: string;
  questions: QuizQuestion[];
  createdAt: number;
  createdBy: {
    userId: string;
    name: string;
    identity: ClientIdentity;
    createdAt: number;
  };
}

interface UpsertPlayerPayload {
  quizId: string;
  playerId: string;
  name: string;
  identity: ClientIdentity;
  joinedAt: number;
}

interface SuspicionPayload {
  quizId: string;
  playerId: string;
  suspicionScore: number;
  flags: string[];
}

interface RecordAnswerPayload {
  quizId: string;
  questionId: string;
  questionIndex: number;
  playerId: string;
  choiceIndex: number;
  isCorrect: boolean;
  submittedAt: number;
  timeTakenMs: number;
  tabSwitchCount: number;
  remainingAtAnswer: number;
}

class QuizPersistence {
  private readonly client: MongoClient;

  private connected = false;

  constructor() {
    const uri = process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017";
    this.client = new MongoClient(uri);
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    await this.client.connect();
    this.connected = true;

    await this.client
      .db(this.dbName())
      .collection("users")
      .createIndex({ email: 1 }, { unique: true });
    await this.client
      .db(this.dbName())
      .collection("quizzes")
      .createIndex({ quizId: 1 }, { unique: true });
    await this.client
      .db(this.dbName())
      .collection("players")
      .createIndex({ quizId: 1, playerId: 1 }, { unique: true });
    await this.client
      .db(this.dbName())
      .collection("answers")
      .createIndex({ quizId: 1, questionId: 1, playerId: 1 }, { unique: true });
    await this.client
      .db(this.dbName())
      .collection("events")
      .createIndex({ quizId: 1, at: 1 });

    console.log(`[Mongo] Connected to ${this.dbName()}`);
  }

  async close(): Promise<void> {
    if (!this.connected) return;
    await this.client.close();
    this.connected = false;
  }

  // === User Management ===

  async registerUser(
    userId: string,
    email: string,
    name: string,
    passwordHash: string,
    role: "organizer" | "participant",
  ): Promise<User> {
    const now = Date.now();
    const user: User = {
      userId,
      email,
      name,
      passwordHash,
      role,
      createdAt: now,
      updatedAt: now,
    };

    await this.client
      .db(this.dbName())
      .collection("users")
      .insertOne(user as any);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.client
      .db(this.dbName())
      .collection("users")
      .findOne({ email });
    return user as User | null;
  }

  async findUserById(userId: string): Promise<User | null> {
    const user = await this.client
      .db(this.dbName())
      .collection("users")
      .findOne({ userId });
    return user as User | null;
  }

  // === Quiz Management ===

  async createQuiz(payload: CreateQuizPayload): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("quizzes")
      .insertOne({
        quizId: payload.quizId,
        code: payload.code,
        title: payload.title,
        moduleTitle: payload.moduleTitle,
        questions: payload.questions,
        questionCount: payload.questions.length,
        phase: "lobby" satisfies QuizPhase,
        createdAt: payload.createdAt,
        updatedAt: payload.createdAt,
        endedAt: null,
        createdBy: payload.createdBy,
        participantCount: 0,
      });
  }

  async upsertPlayer(payload: UpsertPlayerPayload): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("players")
      .updateOne(
        { quizId: payload.quizId, playerId: payload.playerId },
        {
          $set: {
            name: payload.name,
            identity: payload.identity,
            joinedAt: payload.joinedAt,
            leftAt: null,
            updatedAt: Date.now(),
          },
          $setOnInsert: {
            quizId: payload.quizId,
            playerId: payload.playerId,
            suspicionScore: 0,
            flags: [],
            score: 0,
          },
        },
        { upsert: true },
      );
  }

  async updateSuspicion(payload: SuspicionPayload): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("players")
      .updateOne(
        { quizId: payload.quizId, playerId: payload.playerId },
        {
          $set: {
            suspicionScore: payload.suspicionScore,
            flags: payload.flags,
            updatedAt: Date.now(),
          },
        },
      );
  }

  async markPlayerLeft(
    quizId: string,
    playerId: string,
    leftAt: number,
  ): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("players")
      .updateOne(
        { quizId, playerId },
        {
          $set: {
            leftAt,
            updatedAt: leftAt,
          },
        },
      );
  }

  async recordAnswer(payload: RecordAnswerPayload): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("answers")
      .updateOne(
        {
          quizId: payload.quizId,
          questionId: payload.questionId,
          playerId: payload.playerId,
        },
        {
          $set: {
            questionIndex: payload.questionIndex,
            choiceIndex: payload.choiceIndex,
            isCorrect: payload.isCorrect,
            submittedAt: payload.submittedAt,
            timeTakenMs: payload.timeTakenMs,
            tabSwitchCount: payload.tabSwitchCount,
            remainingAtAnswer: payload.remainingAtAnswer,
            updatedAt: Date.now(),
          },
          $setOnInsert: {
            quizId: payload.quizId,
            questionId: payload.questionId,
            playerId: payload.playerId,
          },
        },
        { upsert: true },
      );
  }

  async updatePhase(
    quizId: string,
    phase: QuizPhase,
    at: number,
  ): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("quizzes")
      .updateOne(
        { quizId },
        {
          $set: {
            phase,
            updatedAt: at,
            ...(phase === "ended" ? { endedAt: at } : {}),
          },
        },
      );
  }

  async updateScores(quizId: string, players: PlayerSnapshot[]): Promise<void> {
    if (players.length === 0) return;

    const collection = this.client.db(this.dbName()).collection("players");
    await Promise.all(
      players.map((player) =>
        collection.updateOne(
          { quizId, playerId: player.id },
          {
            $set: {
              score: player.score,
              suspicionScore: player.suspicionScore,
              flags: player.flags,
              updatedAt: Date.now(),
            },
          },
        ),
      ),
    );
  }

  async logEvent(
    quizId: string,
    event: QuizEventType,
    at: number,
    payload?: unknown,
  ): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("events")
      .insertOne({
        quizId,
        event,
        at,
        payload: payload ?? null,
      });
  }

  async updateQuizHost(quizId: string, hostUserId: string): Promise<void> {
    await this.client
      .db(this.dbName())
      .collection("quizzes")
      .updateOne(
        { quizId },
        {
          $set: {
            hostedBy: hostUserId,
            updatedAt: Date.now(),
          },
        },
      );
  }

  // === Analytics/History ===

  async getQuizzesByCreator(userId: string): Promise<any[]> {
    console.log(`[getQuizzesByCreator] Fetching quizzes for userId: ${userId}`);
    const quizzes = await this.client
      .db(this.dbName())
      .collection("quizzes")
      .find({
        $or: [{ "createdBy.userId": userId }, { hostedBy: userId }],
      })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`[getQuizzesByCreator] Found ${quizzes.length} quizzes`);

    return quizzes.map((q) => {
      console.log(
        `[getQuizzesByCreator] Mapping quiz: id=${q.quizId}, title=${q.title}, createdBy.userId=${q.createdBy?.userId}, hostedBy=${q.hostedBy}`,
      );
      return {
        _id: q._id,
        quizId: q.quizId,
        code: q.code,
        title: q.title,
        moduleTitle: q.moduleTitle,
        moduleId: parseInt(q.moduleTitle.split(" ")[1]) || 1,
        createdAt: q.createdAt,
        endedAt: q.endedAt,
        questionCount: q.questionCount,
        phase: q.phase,
        participantCount: q.participantCount || 0,
        createdBy: q.createdBy,
        hostedBy: q.hostedBy,
      };
    });
  }

  async getAllQuizzes(): Promise<any[]> {
    const quizzes = await this.client
      .db(this.dbName())
      .collection("quizzes")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return quizzes.map((q) => ({
      _id: q._id,
      quizId: q.quizId,
      code: q.code,
      title: q.title,
      moduleTitle: q.moduleTitle,
      moduleId: parseInt(q.moduleTitle.split(" ")[1]) || 1,
      createdAt: q.createdAt,
      endedAt: q.endedAt,
      questionCount: q.questionCount,
      phase: q.phase,
      participantCount: q.participantCount || 0,
      createdBy: q.createdBy,
    }));
  }

  async getQuizByCode(code: string): Promise<any> {
    const quizzesCollection = this.client
      .db(this.dbName())
      .collection("quizzes");

    const quiz = await quizzesCollection.findOne({ code });
    return quiz
      ? {
          quizId: quiz.quizId,
          code: quiz.code,
          title: quiz.title,
          moduleTitle: quiz.moduleTitle,
          questions: quiz.questions,
        }
      : null;
  }

  async getQuizById(quizId: string): Promise<any> {
    const quizzesCollection = this.client
      .db(this.dbName())
      .collection("quizzes");

    const quiz = await quizzesCollection.findOne({ quizId });
    return quiz
      ? {
          quizId: quiz.quizId,
          code: quiz.code,
          title: quiz.title,
          moduleTitle: quiz.moduleTitle,
          questions: quiz.questions,
        }
      : null;
  }

  async getQuizResponses(quizId: string): Promise<any[]> {
    const quizzesCollection = this.client
      .db(this.dbName())
      .collection("quizzes");
    const quiz = await quizzesCollection.findOne({ quizId });

    const players = await this.client
      .db(this.dbName())
      .collection("players")
      .find({ quizId })
      .toArray();

    const answersCollection = this.client
      .db(this.dbName())
      .collection("answers");

    return Promise.all(
      players.map(async (player) => {
        const answers = await answersCollection
          .find({ quizId, playerId: player.playerId })
          .sort({ submittedAt: 1 })
          .toArray();

        return {
          playerId: player.playerId,
          playerName: player.name,
          score: player.score || 0,
          suspicionScore: player.suspicionScore || 0,
          tabSwitchCount: answers.reduce(
            (sum, a) => sum + (a.tabSwitchCount || 0),
            0,
          ),
          answeredQuestions: answers.length,
          joinedAt: player.joinedAt,
          flags: player.flags || [],
          answers: answers.map((a) => {
            // Find the question text from quiz
            const question = quiz?.questions?.[a.questionIndex];
            return {
              questionId: a.questionId,
              questionText: question?.text || "Question",
              choiceIndex: a.choiceIndex,
              correct: a.isCorrect,
              timeTakenMs: a.timeTakenMs || 0,
              submittedAt: a.submittedAt,
            };
          }),
        };
      }),
    );
  }

  // === Admin Analytics ===

  async getAdminStats(): Promise<any> {
    const quizzesCollection = this.client
      .db(this.dbName())
      .collection("quizzes");
    const playersCollection = this.client
      .db(this.dbName())
      .collection("players");

    const totalQuizzes = await quizzesCollection.countDocuments();
    const totalPlayers = await playersCollection.countDocuments();

    // Get flagged players (suspicion score > 5)
    const flaggedPlayers = await playersCollection.countDocuments({
      suspicionScore: { $gt: 5 },
    });

    // Calculate average suspicion score
    const suspicionStats = await playersCollection
      .aggregate([
        { $group: { _id: null, avgScore: { $avg: "$suspicionScore" } } },
      ])
      .toArray();

    const averageSuspicion = suspicionStats[0]?.avgScore || 0;

    return {
      totalQuizzes,
      totalPlayers,
      flaggedPlayers,
      averageSuspicion: Math.round(averageSuspicion * 100) / 100,
    };
  }

  async getFlaggedPlayers(): Promise<any[]> {
    const quizzesCollection = this.client
      .db(this.dbName())
      .collection("quizzes");
    const playersCollection = this.client
      .db(this.dbName())
      .collection("players");

    // Find all players with suspicion score > 4
    const flaggedPlayers = await playersCollection
      .find({ suspicionScore: { $gt: 4 } })
      .sort({ suspicionScore: -1 })
      .toArray();

    return Promise.all(
      flaggedPlayers.map(async (player) => {
        const quiz = await quizzesCollection.findOne({ quizId: player.quizId });

        return {
          playerId: player.playerId,
          playerName: player.name,
          quizTitle: quiz?.title || "Unknown Quiz",
          suspicionScore: player.suspicionScore,
          flags: player.flags || [],
          tabSwitchCount: player.tabSwitchCount || 0,
          answeredQuestions: 0, // Would need to count from answers collection
          joinedAt: player.joinedAt,
        };
      }),
    );
  }

  private dbName(): string {
    return process.env.MONGO_DB_NAME ?? "quiz_app";
  }
}

export const quizPersistence = new QuizPersistence();
