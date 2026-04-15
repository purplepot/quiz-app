#!/usr/bin/env node

/**
 * Database Seeder - Load quizzes from JSON files into MongoDB
 *
 * Usage:
 *   node server/seed-db.js
 *
 * This will read all JSON quiz files from seed-quizzes/ and insert them into MongoDB.
 */

import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "quiz_app";
const SEED_DIR = path.join(__dirname, "../seed-quizzes");

// Quiz code generator (matches server/utils.ts)
function generateQuizCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function seedDatabase() {
  const client = new MongoClient(MONGO_URI);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const quizzesCollection = db.collection("quizzes");

    // Read seed quiz files
    const files = fs
      .readdirSync(SEED_DIR)
      .filter((f) => f.startsWith("module-") && f.endsWith(".json"));

    if (files.length === 0) {
      console.warn("⚠️  No quiz files found in seed-quizzes/");
      return;
    }

    console.log(`\n📋 Found ${files.length} quiz file(s):\n`);

    let totalInserted = 0;

    // Process each quiz file
    for (const file of files) {
      const filePath = path.join(SEED_DIR, file);
      const quizData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      const quizId = randomUUID();
      const code = generateQuizCode();
      const now = Date.now();

      // Create quiz document
      const quizDoc = {
        quizId,
        code,
        title: quizData.title,
        moduleTitle: quizData.title,
        questions: quizData.questions,
        questionCount: quizData.questions.length,
        phase: "lobby",
        createdAt: now,
        updatedAt: now,
        endedAt: null,
        createdBy: {
          userId: "seeder-admin",
          name: "Quiz Seeder",
          identity: {
            deviceId: "seeder",
            userAgent: "seed-db/1.0",
            platform: "node",
            language: "en",
            timezone: "UTC",
            screen: { width: 0, height: 0 },
          },
          createdAt: now,
        },
        participantCount: 0,
      };

      // Insert into MongoDB
      const result = await quizzesCollection.insertOne(quizDoc);

      console.log(`✅ ${quizData.title}`);
      console.log(`   Code: ${code}`);
      console.log(`   Questions: ${quizData.questions.length}`);
      console.log(`   MongoDB ID: ${result.insertedId}\n`);

      totalInserted++;
    }

    console.log(
      `\n🎉 Seeding complete! ${totalInserted} quiz(zes) inserted into MongoDB.\n`,
    );

    // Show connection info
    console.log("📚 Quiz Details:");
    const allQuizzes = await quizzesCollection.find({}).toArray();
    allQuizzes.forEach((q) => {
      console.log(`   • ${q.title} (Code: ${q.code})`);
    });
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

seedDatabase();
