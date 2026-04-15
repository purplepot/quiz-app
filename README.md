# Quiz App - Real-time WebSocket

An interactive real-time quiz inspired by Kahoot, built with WebSocket, React, and TypeScript.

## Prerequisites

- **Node.js >= 18**
- **npm** (included with Node.js)
- **MongoDB local instance** (default URI: `mongodb://127.0.0.1:27017`)

## Persistence and Audit Tracking

The server now persists quiz runs and player activity in MongoDB so each session is traceable.

Stored collections:

- `quizzes`: quiz metadata, creator identity, phases, and timestamps
- `players`: player identity, join/leave times, score, suspicion score, and flags
- `answers`: answer history per player and question, including timing telemetry
- `events`: host actions and quiz lifecycle events (start/next/end/leaderboard)

Suspicion signals currently tracked:

- unusually fast answers
- many tab switches during a question
- invalid timestamps
- submit while tab is unfocused
- same device used with multiple names

These are risk indicators, not automatic cheating verdicts.

## Project Structure

```text
quiz-app/
├── packages/
│   └── shared-types/       # Shared TypeScript types (COMPLETE)
├── server/                 # Node.js WebSocket server
│   └── src/
│       ├── utils.ts        # WS send utilities (COMPLETE)
│       ├── QuizRoom.ts     # Quiz room logic (TO IMPLEMENT)
│       └── index.ts        # Server entry point (TO IMPLEMENT)
├── host-app/               # React app for the presenter
│   └── src/
│       ├── hooks/
│       │   └── useWebSocket.ts   # WebSocket hook (COMPLETE)
│       ├── App.tsx               # Main router (TO IMPLEMENT)
│       ├── App.css               # Styles (COMPLETE)
│       └── components/           # UI components (TO IMPLEMENT)
│           ├── CreateQuiz.tsx
│           ├── Lobby.tsx
│           ├── QuestionView.tsx
│           ├── Results.tsx
│           └── Leaderboard.tsx
└── player-app/             # React app for players
    └── src/
        ├── hooks/
        │   └── useWebSocket.ts   # WebSocket hook (COMPLETE)
        ├── App.tsx               # Main router (TO IMPLEMENT)
        ├── App.css               # Styles (COMPLETE)
        └── components/           # UI components (TO IMPLEMENT)
            ├── JoinScreen.tsx
            ├── WaitingLobby.tsx
            ├── AnswerScreen.tsx
            ├── FeedbackScreen.tsx
            └── ScoreScreen.tsx
```

## What Is COMPLETE (Provided)

- **Shared types** (`packages/shared-types/`): all interfaces and message types for WebSocket communication
- **Server utilities** (`server/src/utils.ts`): `send()`, `broadcast()`, `generateQuizCode()`
- **useWebSocket hook** (`host-app/src/hooks/useWebSocket.ts` and `player-app/src/hooks/useWebSocket.ts`): complete React hook with auto-reconnect
- **CSS** (`host-app/src/App.css` and `player-app/src/App.css`): complete styles
- **Configuration**: all `package.json`, `tsconfig.json`, and `vite.config.ts` files

## What Is TO IMPLEMENT

Each file to implement contains typed skeletons with `TODO` comments.

### Server (`server/`)

- `QuizRoom.ts`: quiz room business logic (start, questions, answers, scores)
- `index.ts`: route WebSocket messages to the correct methods

### Host App (`host-app/`)

- `App.tsx`: state management and phase routing
- `CreateQuiz.tsx`: quiz creation form
- `Lobby.tsx`: waiting room with code and players list
- `QuestionView.tsx`: current question display
- `Results.tsx`: animated result bars
- `Leaderboard.tsx`: player ranking

### Player App (`player-app/`)

- `App.tsx`: state management and phase routing
- `JoinScreen.tsx`: form to join a quiz
- `WaitingLobby.tsx`: waiting screen
- `AnswerScreen.tsx`: colored answer buttons
- `FeedbackScreen.tsx`: correct/incorrect feedback
- `ScoreScreen.tsx`: ranking with player highlight

## Installation

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Install host-app dependencies
cd ../host-app
npm install

# 3. Install player-app dependencies
cd ../player-app
npm install

# 4. Ensure MongoDB is running locally
# Example on Windows if MongoDB is installed as a service:
# net start MongoDB
```

Optional server env vars:

- `MONGO_URI` (default `mongodb://127.0.0.1:27017`)
- `MONGO_DB_NAME` (default `quiz_app`)

## Run

Open **3 terminals**:

```bash
# Terminal 1 - WebSocket Server (port 3001)
cd server
npm run dev

# Terminal 2 - Host App (port 5173)
cd host-app
npm run dev

# Terminal 3 - Player App (port 5174)
cd player-app
npm run dev
```

## Team Split (3 People)

### Person 1: Server (`server/`)

- Implement `QuizRoom.ts`: full business logic
- Implement `index.ts`: message routing
- **Key points**: timer management, score calculation, game lifecycle

### Person 2: Host App (`host-app/`)

- Implement `App.tsx`: server message handling and phase transitions
- Implement the 5 components in `components/`
- **Key points**: dynamic form, quiz code display, animated bars

### Person 3: Player App (`player-app/`)

- Implement `App.tsx`: server message handling and phase transitions
- Implement the 5 components in `components/`
- **Key points**: join form, colored answer buttons, visual feedback

## Communication Flow

```text
Host App                    Server                      Player App
   |                          |                            |
   |-- host:create ---------->|                            |
   |<-- sync (lobby) ---------|                            |
   |                          |<------ join ---------------|
   |<-- joined ---------------|------- joined ------------>|
   |-- host:start ----------->|                            |
   |<-- question -------------|------- question ---------->|
   |                          |<------ answer -------------|
   |<-- tick -----------------|------- tick -------------->|
   |<-- results --------------|------- results ----------->|
   |-- host:next ------------>|                            |
   |<-- question -------------|------- question ---------->|
   |   ...                    |   ...                      |
   |-- host:end ------------->|                            |
   |<-- ended ----------------|------- ended ------------->|
```

## Score Calculation (Suggestion)

- Correct answer: 1000 base points
- Speed bonus: up to +500 points based on remaining time
- Formula: `score = 1000 + Math.round(500 * (remaining / timerSec))`
