import { createServer } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import type {
  ClientMessage,
  PlayerSnapshot,
} from "../../packages/shared-types";
import { QuizRoom } from "./QuizRoom";
import { quizPersistence } from "./persistence";
import { generateQuizCode, send } from "./utils";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "./auth";

const PORT = parseInt(process.env.PORT || "3003");

const rooms = new Map<string, QuizRoom>();
const clientRoomMap = new Map<
  WebSocket,
  { room: QuizRoom; playerId: string }
>();
const hostRoomMap = new Map<WebSocket, QuizRoom>();

// HTTP request handler for auth endpoints
async function handleHttpRequest(req: any, res: any) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  console.log(`[HTTP] ${req.method} ${pathname}`);

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (pathname === "/api/auth/register" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { email, name, password, role } = JSON.parse(body);
        if (
          !email ||
          !name ||
          !password ||
          !["organizer", "participant"].includes(role)
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Missing or invalid fields" }));
          return;
        }

        const existing = await quizPersistence.findUserByEmail(email);
        if (existing) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Email already registered" }));
          return;
        }

        const userId = randomUUID();
        const passwordHash = hashPassword(password);
        const user = await quizPersistence.registerUser(
          userId,
          email,
          name,
          passwordHash,
          role,
        );
        const token = generateToken(userId);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            token,
            user: {
              userId: user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          }),
        );
      } catch (error) {
        console.error("[Auth] Register error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  } else if (pathname === "/api/auth/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);
        if (!email || !password) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Email and password required" }));
          return;
        }

        const user = await quizPersistence.findUserByEmail(email);
        if (!user || !verifyPassword(password, user.passwordHash)) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid credentials" }));
          return;
        }

        const token = generateToken(user.userId);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            token,
            user: {
              userId: user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          }),
        );
      } catch (error) {
        console.error("[Auth] Login error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  } else if (pathname === "/api/auth/verify" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", async () => {
      try {
        const { token } = JSON.parse(body);
        const { userId, isValid } = verifyToken(token ?? "");

        if (!isValid) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid token" }));
          return;
        }

        const user = await quizPersistence.findUserById(userId);
        if (!user) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User not found" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            user: {
              userId: user.userId,
              email: user.email,
              name: user.name,
              role: user.role,
            },
          }),
        );
      } catch (error) {
        console.error("[Auth] Verify error:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  } else if (pathname === "/api/quizzes/available" && req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const { userId, isValid } = verifyToken(token ?? "");

      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      // Fetch all available quizzes (seeded + created by all users)
      const quizzes = await quizPersistence.getAllQuizzes();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quizzes));
    } catch (error) {
      console.error("[API] Get available quizzes error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else if (pathname === "/api/quizzes" && req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const { userId, isValid } = verifyToken(token ?? "");

      console.log(`[API /api/quizzes] Token: ${token ? "present" : "missing"}`);
      console.log(
        `[API /api/quizzes] Token valid: ${isValid}, userId: ${userId}`,
      );

      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      // Fetch all quizzes created by this user
      console.log(
        `[API /api/quizzes] Calling getQuizzesByCreator for userId: ${userId}`,
      );
      const quizzes = await quizPersistence.getQuizzesByCreator(userId);

      console.log(`[API /api/quizzes] Got ${quizzes.length} quizzes`);
      quizzes.forEach((q) => {
        console.log(
          `  - Quiz: ${q.title} (code: ${q.code}, createdBy: ${q.createdBy?.userId || "N/A"}, hostedBy: ${q.hostedBy || "N/A"}, participants: ${q.participantCount}, endedAt: ${q.endedAt ? new Date(q.endedAt).toLocaleString() : "N/A"})`,
        );
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quizzes));
    } catch (error) {
      console.error("[API] Get quizzes error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else if (
    req.method === "GET" &&
    pathname.startsWith("/api/quizzes/") &&
    !pathname.includes("/responses")
  ) {
    // Get single quiz by ID
    console.log(`[API] Matched quiz by ID endpoint: ${pathname}`);
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      console.log(`[API] Auth header: ${authHeader}`);
      const { userId, isValid } = verifyToken(token ?? "");

      console.log(
        `[API] Token check - present: ${!!token}, valid: ${isValid}, userId: ${userId}`,
      );

      if (!isValid) {
        console.log(`[API] Unauthorized - returning 401`);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const quizId = pathname.split("/")[3];
      console.log(`[API] Fetching quiz with ID: ${quizId}`);
      const quiz = await quizPersistence.getQuizById(quizId);
      console.log(`[API] Quiz found:`, !!quiz);

      if (!quiz) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Quiz not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(quiz));
    } catch (error) {
      console.error("[API] Get quiz error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else if (
    req.method === "GET" &&
    pathname.startsWith("/api/quizzes/") &&
    pathname.includes("/responses")
  ) {
    // Get quiz responses
    console.log(`[API] Matched quiz responses endpoint: ${pathname}`);
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const { userId, isValid } = verifyToken(token ?? "");

      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const quizId = pathname.split("/")[3];
      console.log(`[API] Fetching responses for quiz: ${quizId}`);
      const responses = await quizPersistence.getQuizResponses(quizId);
      console.log(`[API] Got ${responses.length} response records`);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(responses));
    } catch (error) {
      console.error("[API] Get responses error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else if (pathname === "/api/admin/stats" && req.method === "GET") {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const { userId, isValid } = verifyToken(token ?? "");

      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const stats = await quizPersistence.getAdminStats();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (error) {
      console.error("[API] Get stats error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else if (
    pathname === "/api/admin/flagged-players" &&
    req.method === "GET"
  ) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.replace("Bearer ", "");
      const { userId, isValid } = verifyToken(token ?? "");

      if (!isValid) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized" }));
        return;
      }

      const flaggedPlayers = await quizPersistence.getFlaggedPlayers();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(flaggedPlayers));
    } catch (error) {
      console.error("[API] Get flagged players error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  } else {
    console.log(`[HTTP] No route matched for ${req.method} ${pathname}`);
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Quiz WebSocket Server is running");
  }
}

const httpServer = createServer(handleHttpRequest);

const wss = new WebSocketServer({ server: httpServer });

console.log(`[Server] Starting on port ${PORT}...`);

wss.on("connection", (ws: WebSocket) => {
  console.log("[Server] New WebSocket connection");

  ws.on("message", async (raw: Buffer) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(ws, { type: "error", message: "Invalid JSON message" });
      return;
    }

    switch (message.type) {
      case "join": {
        const room = rooms.get(message.quizCode);
        console.log(
          `[join] Player attempting to join code: ${message.quizCode}, rooms available: ${Array.from(rooms.keys()).join(", ")}`,
        );
        if (!room) {
          console.log(`[join] Room not found for code: ${message.quizCode}`);
          send(ws, { type: "error", message: "Room does not exist" });
          break;
        }
        if (room.phase !== "lobby") {
          console.log(`[join] Room is in phase ${room.phase}, not lobby`);
          send(ws, { type: "error", message: "Room is no longer in lobby" });
          break;
        }

        console.log(
          `[join] Adding player ${message.name} to room ${message.quizCode}`,
        );
        const playerId = room.addPlayer(
          message.name,
          ws,
          message.identity,
          message.joinedAt,
        );
        clientRoomMap.set(ws, { room, playerId });
        break;
      }

      case "answer": {
        const entry = clientRoomMap.get(ws);
        if (!entry) {
          send(ws, {
            type: "error",
            message: "Player not registered in a room",
          });
          break;
        }
        entry.room.handleAnswer(
          entry.playerId,
          message.questionId,
          message.choiceIndex,
          message.telemetry,
        );
        break;
      }

      case "host:create": {
        const code = generateQuizCode();
        const id = crypto.randomUUID();
        const room = new QuizRoom(id, code);

        room.hostWs = ws;
        room.title = message.title;
        room.questions = message.questions;

        rooms.set(code, room);
        hostRoomMap.set(ws, room);

        const createdAt = Date.now();
        await quizPersistence.createQuiz({
          quizId: id,
          code,
          title: message.title,
          moduleTitle: message.moduleTitle,
          questions: message.questions,
          createdAt,
          createdBy: message.createdBy,
        });

        send(ws, {
          type: "sync",
          phase: "lobby",
          data: { quizCode: code, quizId: id },
        });
        break;
      }

      case "host:join": {
        try {
          const quizCode = message.quizCode;
          const hostUserId = message.userId;
          console.log(
            `[host:join] Attempting to join quiz with code: ${quizCode}, hostUserId: ${hostUserId}`,
          );
          let room = rooms.get(quizCode);

          // If room doesn't exist, fetch from DB and create it
          if (!room) {
            console.log(`[host:join] Room not in memory, fetching from DB...`);
            const quizData = await quizPersistence.getQuizByCode(quizCode);
            if (!quizData) {
              console.log(
                `[host:join] Quiz not found in database with code: ${quizCode}`,
              );
              send(ws, { type: "error", message: "Quiz not found" });
              break;
            }

            console.log(
              `[host:join] Quiz found: ${quizData.title}, creating room...`,
            );
            const id = quizData.quizId;
            room = new QuizRoom(id, quizCode);
            room.title = quizData.title;
            room.questions = quizData.questions;
            rooms.set(quizCode, room);
            console.log(
              `[host:join] Room created and added to rooms map. Total rooms: ${rooms.size}`,
            );

            // Update the quiz in DB to mark this user as the host
            if (hostUserId) {
              await quizPersistence
                .updateQuizHost(id, hostUserId)
                .catch((err) =>
                  console.error("[host:join] Failed to update host:", err),
                );
            }
          }

          room.hostWs = ws;
          hostRoomMap.set(ws, room);

          console.log(
            `[host:join] Host joined successfully, sending sync message`,
          );
          send(ws, {
            type: "sync",
            phase: "lobby",
            data: { quizCode: quizCode, quizId: room.id },
          });
        } catch (err) {
          console.error("[host:join] Error:", err);
          send(ws, { type: "error", message: "Failed to join quiz" });
        }
        break;
      }

      case "host:start": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "Host room not found" });
          break;
        }
        await quizPersistence.logEvent(
          room.id,
          "host_start",
          message.triggeredAt,
        );
        room.start();
        break;
      }

      case "host:next": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "Host room not found" });
          break;
        }
        await quizPersistence.logEvent(
          room.id,
          "host_next",
          message.triggeredAt,
        );
        room.nextQuestion();
        break;
      }

      case "host:end": {
        const room = hostRoomMap.get(ws);
        if (!room) {
          send(ws, { type: "error", message: "Host room not found" });
          break;
        }

        // Save final player scores and data before ending
        const playerSnapshots: PlayerSnapshot[] = Array.from(
          room.players.values(),
        ).map((player) => ({
          id: player.id,
          name: player.name,
          joinedAt: player.joinedAt,
          score: room.scores.get(player.id) || 0,
          suspicionScore: player.suspicionScore,
          flags: Array.from(player.flags),
        }));

        console.log(
          `[host:end] Saving final scores for ${playerSnapshots.length} players`,
        );
        await quizPersistence
          .updateScores(room.id, playerSnapshots)
          .catch((err) =>
            console.error("[host:end] Failed to update scores:", err),
          );

        // Update quiz with final participant count
        // Note: updateParticipantCount method doesn't exist, participant count is tracked elsewhere
        // await quizPersistence
        //   .updateParticipantCount(room.id, playerSnapshots.length)
        //   .catch((err: any) =>
        //     console.error(
        //       "[host:end] Failed to update participant count:",
        //       err,
        //     ),
        //   );

        await quizPersistence.logEvent(
          room.id,
          "host_end",
          message.triggeredAt,
        );
        room.end();

        rooms.delete(room.code);
        hostRoomMap.delete(ws);

        for (const [clientWs, entry] of clientRoomMap.entries()) {
          if (entry.room === room) {
            clientRoomMap.delete(clientWs);
          }
        }
        break;
      }

      default:
        send(ws, { type: "error", message: "Unknown message type" });
    }
  });

  ws.on("close", () => {
    const hostRoom = hostRoomMap.get(ws);
    if (hostRoom) {
      hostRoom.end();
      rooms.delete(hostRoom.code);
      hostRoomMap.delete(ws);

      for (const [clientWs, entry] of clientRoomMap.entries()) {
        if (entry.room === hostRoom) {
          clientRoomMap.delete(clientWs);
        }
      }
      return;
    }

    const client = clientRoomMap.get(ws);
    if (client) {
      client.room.removePlayer(client.playerId);
      clientRoomMap.delete(ws);
    }
  });

  ws.on("error", (err: Error) => {
    console.error("[Server] WebSocket error:", err.message);
  });
});

async function startServer() {
  await quizPersistence.connect();

  httpServer.listen(PORT, () => {
    console.log(`[Server] WebSocket server started on ws://localhost:${PORT}`);
  });
}

void startServer();

async function shutdown() {
  await quizPersistence.close();
  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown();
});

process.on("SIGTERM", () => {
  void shutdown();
});
