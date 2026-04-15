# Quiz Files - Module 4 & 5

## 📚 Quiz Data Files

Two quiz JSON files have been created with all questions and answers:

1. **`seed-quizzes/module-4-ipv4-subnetting.json`** (10 questions)
   - IPv4 Addressing, Subnetting, CIDR notation
   - Each question has 45-60 second timer

2. **`seed-quizzes/module-5-routing-algorithms.json`** (10 questions)
   - Routing types, Distance Vector, Link State algorithms
   - Each question has 45-60 second timer

## 🚀 How to Load These Quizzes into MongoDB

### ⚡ Fastest Way: Automatic Database Seeding

Make sure MongoDB is running, then:

```bash
cd server
node seed-db.js
```

This will:

- ✅ Connect to MongoDB
- ✅ Read all quiz JSON files from `seed-quizzes/`
- ✅ Generate unique quiz codes
- ✅ Insert quizzes directly into the database
- ✅ Show you the quiz codes

**Output:**

```
✅ Module 4
   Code: ABC123
   Questions: 10

✅ Module 5
   Code: XYZ789
   Questions: 10

🎉 Seeding complete! 2 quiz(zes) inserted into MongoDB.
```

### Alternative: Manual Creation (UI)

If you want to add more quizzes via the web interface:

1. Start the apps:

   ```bash
   # Terminal 1: Server
   cd server && npm run dev

   # Terminal 2: Host App
   cd host-app && npm run dev

   # Terminal 3: Player App
   cd player-app && npm run dev
   ```

2. Go to http://localhost:5173 (host app)
3. Sign up as organizer
4. Click **"+ New Quiz"** button
5. For each quiz:
   - **Module**: Select "Module 4" or "Module 5"
   - **Title**: Enter "Module 4" or "Module 5"
   - **Questions**: Add all 10 questions
   - **Submit** → Quizzes start when you click "Start" in lobby

## 📋 Quiz Structure

Each quiz file contains:

```json
{
  "moduleId": 4 or 5,
  "title": "Module 4" or "Module 5",
  "questions": [
    {
      "id": "unique-id",
      "text": "Question text",
      "choices": ["A", "B", "C", "D"],
      "correctIndex": 0,   // 0-3 for A-D
      "timerSec": 45-60
    }
  ]
}
```

## ✅ Questions Included

### Module 4 (IPv4 & Subnetting)

- IPv4 address classification (Classes A-D)
- Valid IPv4 formats
- Subnet calculations (/28, /24, etc.)
- Network address extraction
- Bitwise operations (AND, OR, XOR)
- Class B subdivision
- Subnetting and supernetting concepts
- IP block requirements

### Module 5 (Routing Algorithms)

- Routing stability and adaptiveness
- Cost metrics (Delay, Bandwidth, Traffic)
- Flooding algorithm with hop count
- Distance Vector vs Link State
- Bellman-Ford algorithm
- Split horizon technique
- RIP timeout values
- Periodic vs triggered updates
- Count-to-infinity problem

---

**🎯 Quickest way to get started:**

```bash
cd server
node seed-db.js
```

Then start the apps and you'll see both quizzes ready in the system!
