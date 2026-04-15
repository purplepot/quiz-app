// ============================================================
// Player App - Composant principal
// TO IMPLEMENT: message handling and phase routing
// ============================================================

import { useState, useEffect } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import type {
  LeaderboardEntry,
  PlayerSnapshot,
  QuizPhase,
  QuizQuestion,
} from "@shared/index";
import JoinScreen from "./components/JoinScreen";
import WaitingLobby from "./components/WaitingLobby";
import AnswerScreen from "./components/AnswerScreen";
import FeedbackScreen from "./components/FeedbackScreen";
import ScoreScreen from "./components/ScoreScreen";
import { ParticipantAuthForm } from "./components/ParticipantAuthForm";
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
  const [phase, setPhase] = useState<QuizPhase | "join" | "feedback">("join");
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [players, setPlayers] = useState<PlayerSnapshot[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Omit<
    QuizQuestion,
    "correctIndex"
  > | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [questionStartedAt, setQuestionStartedAt] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setTabSwitchCount((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // --- Server message handling ---
  useEffect(() => {
    if (!lastMessage) return;

    // TODO: Handle each server message type
    // Use a switch on lastMessage.type

    switch (lastMessage.type) {
      case "joined": {
        // Update the player list
        setPlayers(lastMessage.players);
        setPlayerId(lastMessage.playerId);
        setPhase("lobby");
        // Clear errors
        setError(undefined);
        break;
      }

      case "question": {
        // Update currentQuestion with lastMessage.question
        setCurrentQuestion(lastMessage.question);
        // Update remaining with lastMessage.question.timerSec
        setRemaining(lastMessage.question.timerSec);
        // Reset hasAnswered to false
        setHasAnswered(false);
        setSelectedChoice(null);
        // Change phase to 'question'
        setQuestionStartedAt(lastMessage.startedAt);
        setTabSwitchCount(0);
        setPhase("question");
        break;
      }

      case "tick": {
        // Update remaining with lastMessage.remaining
        setRemaining(lastMessage.remaining);
        break;
      }

      case "results": {
        // Check whether the player answered correctly
        const isCorrect = selectedChoice === lastMessage.correctIndex;
        // (compare player's answer with lastMessage.correctIndex)
        setLastCorrect(isCorrect);
        // Update score for the current player based on playerId.
        setScore(lastMessage.scoresByPlayerId[playerId] || 0);
        // Change phase to 'feedback'
        setPhase("feedback");
        break;
      }

      case "leaderboard": {
        // Update rankings with lastMessage.rankings
        setRankings(lastMessage.rankings);
        // Change phase to 'leaderboard'
        setPhase("leaderboard");
        break;
      }

      case "ended": {
        // Change phase to 'ended'
        setPhase("ended");
        break;
      }

      case "error": {
        // Store error message in error state
        setError(lastMessage.message);
        break;
      }
    }
  }, [lastMessage, playerId, selectedChoice]);

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
    setPhase("join");
  };

  /** Called when player submits the join form */
  const handleJoin = (code: string, name: string) => {
    // Save player name in playerName
    setPlayerName(name);
    // Send a 'join' message to the server with sendMessage
    //console.log("test :", code, name);
    sendMessage({
      type: "join",
      quizCode: code,
      name,
      identity: getClientIdentity(),
      joinedAt: Date.now(),
    });
  };

  /** Called when player clicks an answer choice */
  const handleAnswer = (choiceIndex: number) => {
    // Ensure the player has not already answered (hasAnswered)
    if (hasAnswered || !currentQuestion) return;
    // Set hasAnswered to true
    setHasAnswered(true);
    setSelectedChoice(choiceIndex);
    // Send an 'answer' message with question id and choiceIndex
    const submittedAt = Date.now();
    sendMessage({
      type: "answer",
      questionId: currentQuestion.id,
      choiceIndex,
      telemetry: {
        submittedAt,
        timeTakenMs: Math.max(0, submittedAt - questionStartedAt),
        tabSwitchCount,
        focusedAtSubmit: document.visibilityState === "visible",
      },
    });
  };

  // --- Phase-based rendering ---
  const renderPhase = () => {
    switch (phase) {
      case "join":
        return <JoinScreen onJoin={handleJoin} error={error} />;

      case "lobby":
        return <WaitingLobby players={players} />;

      case "question":
        return currentQuestion ? (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null;

      case "feedback":
        return <FeedbackScreen correct={lastCorrect} score={score} />;

      case "results":
        // During 'results', stay on FeedbackScreen
        return <FeedbackScreen correct={lastCorrect} score={score} />;

      case "leaderboard":
        return (
          <ScoreScreen
            rankings={rankings}
            playerName={playerName}
            onExit={() => setPhase("join")}
          />
        );

      case "ended":
        return (
          <div className="phase-container">
            <h1>Quiz ended!</h1>
            <p className="ended-message">Thanks for playing!</p>
            <button className="btn-primary" onClick={() => setPhase("join")}>
              Join another quiz
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <div>
        <ParticipantAuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Player</h2>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: "15px",
            alignItems: "center",
          }}
        >
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
    </div>
  );
}
export default App;
