# Quiz App - Academic Integrity Detection System

A comprehensive real-time quiz application built with **React**, **TypeScript**, **WebSocket**, and **Node.js** that detects suspicious behavior patterns to maintain academic integrity during online assessments.

## 🎯 Project Overview

This project demonstrates a sophisticated behavioral analysis system for detecting academic dishonesty in online quizzes. Rather than using machine learning black boxes, it employs transparent, rule-based anomaly detection to identify suspicious patterns in student behavior including:

- **Timing Analysis**: Unusually fast or suspicious answer submission patterns
- **Tab Switching Detection**: Detecting when students switch tabs during quiz
- **Focus Tracking**: Monitoring when the quiz window loses focus
- **Answer Pattern Analysis**: Detecting perfect accuracy with unrealistic timing
- **Collusion Detection**: Identifying suspicious similarities between player answers

## 🛠️ Technology Stack

| Component      | Technology                       |
| -------------- | -------------------------------- |
| **Frontend**   | React 18 + TypeScript            |
| **Host App**   | Vite + React Router              |
| **Player App** | Vite + React Router              |
| **Backend**    | Node.js + Express + TypeScript   |
| **Real-time**  | WebSocket (Socket.IO compatible) |
| **Database**   | MongoDB                          |
| **Styling**    | CSS-in-JS Dark Theme             |
| **Build Tool** | Vite                             |

## 📋 Prerequisites

- **Node.js >= 18**
- **npm** (included with Node.js)
- **MongoDB** (local instance or cloud connection)
  - Default: `mongodb://127.0.0.1:27017`
  - Can be configured via environment variables

## 📁 Project Structure

```
quiz-app/
├── images/                    # Team member profile images
│   ├── priyansh.jpeg          # Lead Developer
│   └── mentor.jpg              # Mentor (Dr Swaminathan)
├── seed-quizzes/              # Pre-built quiz JSON files
│   ├── module-1-networks-fundamentals.json
│   ├── module-2-protocols.json
│   ├── module-3-routing.json
│   ├── module-4-transport-layer.json
│   ├── module-5-addressing.json
│   ├── module-6-congestion.json
│   └── module-7-security.json
├── ml-service/                # Machine Learning service (optional)
├── packages/
│   └── shared-types/          # Shared TypeScript interfaces
│       └── index.ts
├── server/                    # Node.js WebSocket Server
│   ├── src/
│   │   ├── index.ts           # Server entry point & WebSocket routes
│   │   ├── auth.ts            # Authentication & identity verification
│   │   ├── persistence.ts     # MongoDB operations
│   │   ├── QuizRoom.ts        # Quiz room business logic
│   │   └── utils.ts           # Utility functions
│   ├── seed-db.js             # Database seeding script
│   ├── cleanup.js             # Database cleanup script
│   ├── verify.js              # Verification utilities
│   └── package.json
├── host-app/                  # Organizer/Administrator Dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx         # Suspicious activity monitoring
│   │   │   ├── AvailableQuizzes.tsx   # Quiz selection
│   │   │   ├── CreateQuiz.tsx         # Quiz creation form
│   │   │   ├── Leaderboard.tsx        # Real-time leaderboard
│   │   │   ├── Lobby.tsx              # Pre-quiz lobby
│   │   │   ├── OrganizerAuthForm.tsx  # Organizer login
│   │   │   ├── QuestionView.tsx       # Question display & monitoring
│   │   │   ├── QuizHistory.tsx        # Past quiz records (4-column grid)
│   │   │   ├── Results.tsx            # Quiz results & analytics
│   │   │   ├── Learn.tsx              # Educational resource
│   │   │   ├── Help.tsx               # FAQ & system help
│   │   │   ├── References.tsx         # Video tutorials & resources
│   │   │   ├── Credits.tsx            # About project & team info
│   │   │   └── Visualization.tsx      # Interactive demo scenarios
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts        # WebSocket connection hook
│   │   ├── utils/
│   │   │   ├── identity.ts            # Identity management
│   │   │   └── modules.ts             # Module constants
│   │   ├── App.tsx                    # Main router & layout
│   │   ├── App.css                    # Dark theme styles
│   │   └── main.tsx                   # React entry point
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
└── player-app/                # Participant/Student Quiz Interface
    ├── src/
    │   ├── components/
    │   │   ├── AnswerScreen.tsx       # Answer selection UI
    │   │   ├── FeedbackScreen.tsx     # Answer feedback display
    │   │   ├── JoinScreen.tsx         # Quiz join form
    │   │   ├── ParticipantAuthForm.tsx# Student login
    │   │   ├── ScoreScreen.tsx        # Final score display
    │   │   ├── WaitingLobby.tsx       # Waiting for quiz to start
    │   │   ├── Learn.tsx              # Educational resource
    │   │   ├── Help.tsx               # FAQ & system help
    │   │   ├── References.tsx         # Video tutorials & resources
    │   │   ├── Credits.tsx            # About project & team info
    │   │   └── Visualization.tsx      # Interactive demo scenarios
    │   ├── hooks/
    │   │   └── useWebSocket.ts        # WebSocket connection hook
    │   ├── utils/
    │   │   ├── identity.ts            # Identity management
    │   │   └── modules.ts             # Module constants
    │   ├── App.tsx                    # Main router & layout
    │   ├── App.css                    # Dark theme styles
    │   └── main.tsx                   # React entry point
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
├── README.md
├── tsconfig.json
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
cd server && npm install
cd ../host-app && npm install
cd ../player-app && npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (with systemd)
sudo systemctl start mongod

# Windows (MongoDB Community Service)
# Service should auto-start or start via Services app

# Or run local MongoDB in Docker
docker run -d -p 27017:27017 mongo
```

### 3. Seed Sample Quizzes (Optional)

```bash
cd server
node seed-db.js
```

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This command starts:

- **Server**: `http://localhost:3000` (WebSocket server)
- **Host App**: `http://localhost:5173` (Organizer dashboard)
- **Player App**: `http://localhost:5174` (Student interface)

## 📊 Database Schema

### Collections

#### `quizzes`

```json
{
  "_id": ObjectId,
  "title": "Module 1 - Networks Fundamentals",
  "organizer": "prof_id",
  "questions": [
    {
      "question": "What is the Internet?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "time_limit": 30
    }
  ],
  "created_at": ISODate,
  "status": "created|active|completed"
}
```

#### `players`

```json
{
  "_id": ObjectId,
  "quiz_id": ObjectId,
  "name": "Student Name",
  "score": 85,
  "total_questions": 10,
  "suspicion_score": 0.35,
  "flags": ["fast_answers", "tab_switches"],
  "joined_at": ISODate,
  "left_at": ISODate
}
```

#### `answers`

```json
{
  "_id": ObjectId,
  "quiz_id": ObjectId,
  "player_id": ObjectId,
  "question_num": 1,
  "selected": 2,
  "correct": true,
  "time_taken": 3200,
  "tab_switches": 0,
  "focus_lost": false,
  "submission_timestamp": ISODate
}
```

## 🎓 Educational Features

The app includes comprehensive learning resources accessible from the information panel:

### **Learn Module** (Purple #bb86fc)

- System architecture overview
- 5-step detection process explanation
- Key concepts and terminology

### **Help Module** (Cyan #26c6da)

- 7 frequently asked questions
- Flag reference table
- System limitations and disclaimers

### **References Module** (Green #4caf50)

- WebSocket fundamentals video
- Pattern recognition tutorial
- Anomaly detection guide
- Textbook references
- Official technical documentation
- Research papers and datasets

### **Visualization Module** (Blue #42a5f5)

- Interactive demo scenarios (Normal vs Suspicious Student)
- Answer breakdown tables with real-time scoring
- Summary statistics display
- Quiz app overview video

### **Credits Module** (Pink #ce93d8)

- Project overview
- Development team (with photos)
  - **Priyansh** - Lead Developer (Reg: 24BYB1107)
  - **Dr Swaminathan** - Mentor
- Complete technology stack
- Key features highlights
- Architecture component descriptions
- System usage workflow
- Academic integrity principles
- Future enhancement roadmap

## 🔍 Suspicion Detection System

### Scoring Mechanism

Each answer is scored on a 0-1 scale for suspicion:

| Factor       | Score Range | Interpretation                                        |
| ------------ | ----------- | ----------------------------------------------------- |
| Timing       | 0-1         | Very fast submissions (vs average) increase suspicion |
| Tab Switches | 0-1         | Each tab switch adds suspicion                        |
| Correctness  | 0-1         | Perfect accuracy + fast timing = suspicious           |
| **Overall**  | **0-1**     | **Combined assessment**                               |

### Flag Thresholds

- **Green (< 0.3)**: Low suspicion - common study behavior
- **Yellow (0.3-0.6)**: Moderate suspicion - warrants investigation
- **Red (≥ 0.6)**: High suspicion - likely dishonest behavior

## 🎨 UI/UX Features

### Dark Theme

- Primary background: #1a1a1a
- Text color: #e0e0e0
- Component backgrounds: #2d2d2d
- Accent colors vary by module (purple, cyan, green, blue, pink)

### Responsive Design

- Fixed 4-column grid layout for Quiz History
- Mobile-friendly components
- Flexible modal dialogs
- Optional collapse/expand sections

### Real-time Updates

- WebSocket push notifications
- Live suspicious activity alerts
- Instant leaderboard updates
- Real-time player join/leave notifications

## 📚 Scripts

### Server Scripts

```bash
# Seed database with sample quizzes
node seed-db.js

# Clean up test data
node cleanup.js

# Verify database connection
node verify.js

# Run development server
npm run dev
```

### Development Commands

```bash
# Build all apps
npm run build

# Run TypeScript compiler
tsc

# Start concurrent development (root)
npm run dev
```

## 🔐 Security & Authentication

- Organizer authentication with identity verification
- Participant registration with validation
- Session-based quiz access control
- WebSocket message validation
- Suspicious activity logging in database

## 📈 Performance & Monitoring

### Admin Panel Features

- Real-time suspicious player alerts
- Flag status indicators (green/yellow/red)
- Player answer velocity tracking
- Tab switch frequency monitoring
- Demographic insights

### Metrics Tracked

- Average answer time by question
- Distribution of suspicion scores
- Flag frequency by category
- Player retention rates

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# View server logs
npm run dev --prefix server
```

### WebSocket Connection Failures

- Ensure server is running on port 3000
- Check browser console for WebSocket errors
- Verify network doesn't block WebSocket connections

### Build Errors

```bash
# Clear build cache
rm -rf host-app/dist player-app/dist

# Rebuild
npm run build
```

## 🤝 Development Team

- **Priyansh** (24BYB1107) - Lead Developer
- **Dr Swaminathan** - Mentor & Project Advisor

## 📝 License

This project is for educational purposes.

## ⚠️ Important Notes

1. **Not a Cheating Detection Machine**: This system provides risk indicators, not definitive cheating verdicts. Always require human review.
2. **Context Matters**: Unusual patterns can have legitimate explanations (accessibility tools, prior knowledge, test anxiety).
3. **Student Rights**: Always give students the opportunity to explain suspicious patterns.
4. **Transparency**: Make clear to students that behavioral monitoring is happening.

## 🔮 Future Enhancements

- Machine learning models (with historical training data)
- LMS integration (Canvas, Blackboard)
- Advanced visualization dashboards
- Custom rule configuration per institution
- Multi-language support
- Mobile app versions
- Proctoring camera integration

---

**Last Updated**: April 2026  
**Version**: 1.0.0

## Score Calculation (Suggestion)

- Correct answer: 1000 base points
- Speed bonus: up to +500 points based on remaining time
- Formula: `score = 1000 + Math.round(500 * (remaining / timerSec))`
