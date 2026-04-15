#!/usr/bin/env node

/**
 * Quiz Seeder Script
 * 
 * Usage:
 *   node seed-quizzes.js [authToken] [hostId]
 * 
 * This script reads quiz JSON files from seed-quizzes/ directory and creates them
 * via the WebSocket API.
 */

import fs from "fs";
import path from "path";
import { WebSocket } from "ws";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WS_URL = "ws://localhost:3001";
const SEED_DIR = path.join(__dirname, "seed-quizzes");

interface QuizData {
  moduleId: number;
  title: string;
  questions: Array<{
    id: string;
    text: string;
    choices: string[];
    correctIndex: number;
    timerSec: number;
  }>;
}

async function seedQuizzes(authToken: string, hostId: string) {
  console.log("🚀 Starting quiz seeder...");
  console.log(`📁 Reading quizzes from: ${SEED_DIR}`);

  // Read all JSON files from seed directory
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.warn("⚠️  No quiz files found in seed-quizzes/");
    return;
  }

  console.log(`📋 Found ${files.length} quiz file(s):`, files);

  // Connect to WebSocket
  const ws = new WebSocket(WS_URL);

  ws.on("open", () => {
    console.log("✅ Connected to server");

    // Process each quiz file
    files.forEach((file) => {
      const filePath = path.join(SEED_DIR, file);
      try {
        const quizData = JSON.parse(
          fs.readFileSync(filePath, "utf-8"),
        ) as QuizData;

        console.log(`\n📝 Creating quiz: ${quizData.title}`);
        console.log(`   Questions: ${quizData.questions.length}`);

        // Send host:create message
        const message = {
          type: "host:create",
          title: quizData.title,
          moduleTitle: quizData.title,
          questions: quizData.questions.map((q) => ({
            id: q.id,
            text: q.text,
            choices: q.choices,
            correctIndex: q.correctIndex,
            timerSec: q.timerSec,
          })),
          createdBy: {
            userId: hostId,
            name: "Quiz Seeder",
            identity: {
              deviceId: "seeder",
              userAgent: "quiz-seeder/1.0",
              platform: "node",
              language: "en",
              timezone: "UTC",
              screen: { width: 0, height: 0 },
            },
            createdAt: Date.now(),
          },
        };

        ws.send(JSON.stringify(message));
        console.log(`✓ Sent create request for: ${quizData.title}`);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    });

    // Close after 2 seconds to allow responses
    setTimeout(() => {
      console.log("\n✅ Seeding complete!");
      ws.close();
      process.exit(0);
    }, 2000);
  });

  ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error);
    process.exit(1);
  });

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === "sync" && msg.data?.quizCode) {
        console.log(`   ✓ Quiz created with code: ${msg.data.quizCode}`);
      }
    } catch {
      // Ignore non-JSON messages
    }
  });
}

// Get command line arguments
const authToken = process.argv[2] || "test-token";
const hostId = process.argv[3] || "seeder-" + Date.now();

console.log("📚 Quiz Seeder");
console.log(`   Auth Token: ${authToken.substring(0, 10)}...`);
console.log(`   Host ID: ${hostId}\n`);

seedQuizzes(authToken, hostId).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
