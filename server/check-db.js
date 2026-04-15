import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://localhost:27017");

async function check() {
  try {
    await client.connect();
    const db = client.db("quiz_app");
    const quizzes = await db.collection("quizzes").find({}).toArray();

    console.log(`\n✅ Total Quizzes: ${quizzes.length}\n`);

    const grouped = {};
    quizzes.forEach((q) => {
      if (!grouped[q.title]) grouped[q.title] = [];
      grouped[q.title].push({ code: q.code, questions: q.questions.length });
    });

    Object.entries(grouped).forEach(([module, quizzes]) => {
      const details = quizzes
        .map((q) => `${q.code}(${q.questions}Qs)`)
        .join(", ");
      console.log(`${module}: ${quizzes.length} quizzes - ${details}`);
    });
    console.log("");
  } finally {
    await client.close();
  }
}

check();
