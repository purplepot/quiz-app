// ============================================================
// Host App - Composant principal
// TO IMPLEMENT: message handling and phase routing
// ============================================================

import type {
  LeaderboardEntry,
  PlayerSnapshot,
  QuizPhase,
  QuizQuestion,
} from "@shared/index";
import { useEffect, useState } from "react";
import CreateQuiz from "./components/CreateQuiz";
import Leaderboard from "./components/Leaderboard";
import Lobby from "./components/Lobby";
import QuestionView from "./components/QuestionView";
import Results from "./components/Results";
import { OrganizerAuthForm } from "./components/OrganizerAuthForm";
import { QuizHistory } from "./components/QuizHistory";
import { AvailableQuizzes } from "./components/AvailableQuizzes";
import { AdminPanel } from "./components/AdminPanel";
import { useWebSocket } from "./hooks/useWebSocket";
import { getClientIdentity } from "./utils/identity";

const WS_URL = `ws://${window.location.hostname}:3003`;

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
}

// Check for existing login on mount
function restoreAuth(): [boolean, User | null, string | null] {
  const savedToken = localStorage.getItem("auth_token");
  const savedUser = localStorage.getItem("user_data");

  if (savedToken && savedUser) {
    try {
      return [true, JSON.parse(savedUser) as User, savedToken];
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
  }
  return [false, null, null];
}

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL);

  // --- Auth state ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const [loggedIn, savedUser, savedToken] = restoreAuth();
    setIsLoggedIn(loggedIn);
    setUser(savedUser);
    setToken(savedToken);
  }, []);

  // --- Application state ---
  const [phase, setPhase] = useState<QuizPhase | "create">("create");
  const [view, setView] = useState<"quizzes" | "history" | "create" | "admin">(
    "quizzes",
  );
  const [quizCode, setQuizCode] = useState("");
  const [players, setPlayers] = useState<PlayerSnapshot[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    "correctIndex"
  > | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionTotal, setQuestionTotal] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [answerCount, setAnswerCount] = useState(0);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [distribution, setDistribution] = useState<number[]>([]);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);

  // --- Server message handling ---
  useEffect(() => {
    if (!lastMessage) return;

    // TODO: Handle each server message type
    // Use a switch on lastMessage.type

    switch (lastMessage.type) {
      case "sync": {
        setQuizCode(lastMessage.data.quizCode);
        setPhase(lastMessage.phase);
        setView("quizzes"); // Reset view to show phase-based rendering
        break;
      }

      case "joined": {
        // TODO: Update player list with lastMessage.players
        setPlayers(lastMessage.players);
        break;
      }

      case "question": {
        // TODO: Update currentQuestion, questionIndex, questionTotal
        setCurrentQuestion(lastMessage.question);
        setQuestionIndex(lastMessage.index);
        setQuestionTotal(lastMessage.total);
        // TODO: Initialize remaining with question timer duration
        setRemaining(lastMessage.question.timerSec);
        // TODO: Reset answerCount to 0
        setAnswerCount(0);
        // TODO: Change phase to 'question'
        setPhase("question");
        break;
      }

      case "tick": {
        // TODO: Update remaining with lastMessage.remaining
        setRemaining(lastMessage.remaining);
        break;
      }

      case "results": {
        setCorrectIndex(lastMessage.correctIndex);
        setDistribution(lastMessage.distribution);
        setAnswerCount(lastMessage.distribution.reduce((a, b) => a + b, 0));
        setPhase("results");
        break;
      }

      case "leaderboard": {
        // TODO: Update rankings with lastMessage.rankings
        setRankings(lastMessage.rankings);
        // TODO: Change phase to 'leaderboard'
        setPhase("leaderboard");
        break;
      }

      case "ended": {
        // TODO: Change phase to 'ended'
        setPhase("ended");
        break;
      }

      case "error": {
        // TODO: Show error (console.error or alert)
        console.error(lastMessage.message);
        break;
      }
    }
  }, [lastMessage]);

  // --- Handlers ---

  const handleLoginSuccess = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    setPhase("create");
    setView("quizzes");
  };

  /** Called when host submits the creation form */
  const handleCreateQuiz = (questions: QuizQuestion[], moduleId: number) => {
    const title = `Module ${moduleId}`;
    sendMessage({
      type: "host:create",
      title,
      moduleTitle: `Module ${moduleId}`,
      questions,
      createdBy: {
        userId: user?.userId || "",
        name: user?.name || "Host",
        identity: getClientIdentity(),
        createdAt: Date.now(),
      },
    });
  };

  /** Called when host clicks "Start" in the lobby */
  const handleStart = () => {
    sendMessage({ type: "host:start", triggeredAt: Date.now() });
  };

  /** Called when host clicks "Next question" */
  const handleNext = () => {
    sendMessage({ type: "host:next", triggeredAt: Date.now() });
  };

  const handleEnd = () => {
    sendMessage({ type: "host:end", triggeredAt: Date.now() });
  };

  // --- Phase-based rendering ---
  const renderPhase = () => {
    // If we're on a quiz phase (not "create"), show the quiz view
    if (phase !== "create") {
      switch (phase) {
        case "lobby":
          return (
            <Lobby
              quizCode={quizCode}
              players={players}
              onStart={handleStart}
            />
          );

        case "question":
          return currentQuestion ? (
            <QuestionView
              question={currentQuestion}
              index={questionIndex}
              total={questionTotal}
              remaining={remaining}
              answerCount={answerCount}
              totalPlayers={players.length}
            />
          ) : null;

        case "results":
          return currentQuestion ? (
            <Results
              correctIndex={correctIndex}
              distribution={distribution}
              choices={currentQuestion.choices}
              onNext={handleNext}
            />
          ) : null;

        case "leaderboard":
          return (
            <Leaderboard
              rankings={rankings}
              onExit={() => {
                setPhase("create");
                setView("quizzes");
              }}
            />
          );

        case "ended":
          return (
            <div className="phase-container">
              <h1>Quiz ended!</h1>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "2rem",
                }}
              >
                <button
                  className="btn-primary"
                  onClick={() => {
                    setPhase("create");
                    setView("quizzes");
                  }}
                >
                  Back to Quizzes
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setPhase("create");
                    setView("create");
                  }}
                  style={{
                    backgroundColor: "#065f46",
                  }}
                >
                  + Create New Quiz
                </button>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setPhase("create");
                    setView("history");
                  }}
                  style={{
                    backgroundColor: "#7c3aed",
                  }}
                >
                  View History
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    // Otherwise check view (only when phase === "create")
    if (view === "quizzes") {
      return (
        <AvailableQuizzes sendMessage={sendMessage} userId={user?.userId} />
      );
    }

    if (view === "history") {
      return (
        <QuizHistory
          onExit={() => {
            setPhase("create");
            setView("quizzes");
          }}
        />
      );
    }

    if (view === "admin") {
      return <AdminPanel />;
    }

    if (view === "create") {
      return <CreateQuiz onSubmit={handleCreateQuiz} />;
    }

    // Fallback to create view
    return <CreateQuiz onSubmit={handleCreateQuiz} />;
  };

  if (!isLoggedIn) {
    return (
      <div>
        <OrganizerAuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Host</h2>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "15px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "10px",
              borderRight: "1px solid #ddd",
              paddingRight: "15px",
            }}
          >
            <button
              onClick={() => setView("create")}
              style={{
                padding: "8px 12px",
                backgroundColor: "#6366f1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              + New Quiz
            </button>
            <button
              onClick={() => setView("quizzes")}
              style={{
                padding: "8px 12px",
                backgroundColor: view === "quizzes" ? "#6366f1" : "#e5e7eb",
                color: view === "quizzes" ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Quizzes
            </button>
            <button
              onClick={() => setView("history")}
              style={{
                padding: "8px 12px",
                backgroundColor: view === "history" ? "#6366f1" : "#e5e7eb",
                color: view === "history" ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              History
            </button>
            <button
              onClick={() => setView("admin")}
              style={{
                padding: "8px 12px",
                backgroundColor: view === "admin" ? "#ef4444" : "#e5e7eb",
                color: view === "admin" ? "white" : "#333",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Admin
            </button>
          </div>
          <span style={{ fontSize: "14px", color: "#666" }}>
            Logged in as: <strong>{user?.name}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout
          </button>
          <span className={`status-badge status-${status}`}>
            {status === "connected"
              ? "Connected"
              : status === "connecting"
                ? "Connecting..."
                : "Disconnected"}
          </span>
        </span>
      </header>
      <main className="app-main">{renderPhase()}</main>
      {view === "create" && phase !== "create" && phase !== "ended" && (
        <div style={{ padding: "0 1.5rem 1.5rem", textAlign: "center" }}>
          <button className="btn-primary" onClick={handleEnd}>
            End Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
