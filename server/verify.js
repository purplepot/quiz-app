import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'quiz-app';

async function verify() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const quizzes = await db.collection('quizzes').find({}).toArray();
    
    console.log(`\ní³Š Total Quizzes: ${quizzes.length}\n`);
    quizzes.forEach((q, i) => {
      console.log(`${i+1}. Module ${q.moduleId}: ${q.questions.length} Qs (Code: ${q.code})`);
    });
  } finally {
    await client.close();
  }
}

verify();
