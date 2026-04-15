import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'quiz-app';

async function cleanup() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const result = await db.collection('quizzes').deleteMany({});
    console.log(`âœ… Deleted ${result.deletedCount} quizzes`);
    
    const count = await db.collection('quizzes').countDocuments();
    console.log(`í³Š Remaining: ${count}`);
  } finally {
    await client.close();
  }
}

cleanup();
