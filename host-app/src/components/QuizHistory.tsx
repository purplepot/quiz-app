import React, { useState, useEffect } from "react";

interface Quiz {
  _id: string;
  quizId: string;
  code: string;
  title: string;
  moduleTitle: string;
  moduleId: number;
  createdAt: number;
  endedAt: number | null;
  questionCount: number;
  phase: string;
  participantCount: number;
}

interface ParticipantDetail {
  playerId: string;
  playerName: string;
  score: number;
  suspicionScore: number;
  tabSwitchCount: number;
  answeredQuestions: number;
  joinedAt: number;
  flags: string[];
}

interface Answer {
  questionId: string;
  questionText: string;
  choiceIndex: number;
  correct: boolean;
  timeTakenMs: number;
  submittedAt: number;
}

interface ParticipantAnswers extends ParticipantDetail {
  answers: Answer[];
}

export function QuizHistory({ onExit }: { onExit?: () => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showParticipantDetails, setShowParticipantDetails] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<ParticipantAnswers | null>(null);

  const API_URL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:3003";

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      console.log("[QuizHistory] Fetching quizzes with token:", token ? "present" : "missing");
      const res = await fetch(`${API_URL}/api/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch quizzes");

      const data = await res.json();
      console.log("[QuizHistory] Received quizzes:", data);
      console.log("[QuizHistory] Number of quizzes:", data.length);
      setQuizzes(data);
      setError("");
    } catch (err) {
      console.error("[QuizHistory] Error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          ...styles.container,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Loading quizzes...
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.error, textAlign: "center" }}>{error}</div>
        {onExit && (
          <button
            onClick={onExit}
            style={{
              marginTop: "1rem",
              padding: "10px 20px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Quizzes
          </button>
        )}
      </div>
    );
  }

  // Group quizzes by module
  const quizzesByModule: Record<string, Quiz[]> = {};
  quizzes.forEach((quiz) => {
    if (!quizzesByModule[quiz.moduleTitle]) {
      quizzesByModule[quiz.moduleTitle] = [];
    }
    quizzesByModule[quiz.moduleTitle].push(quiz);
  });

  return (
    <div style={styles.container}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ color: "#f1f5f9", fontSize: "2rem", margin: 0 }}>
          Your Quizzes
        </h2>
        {onExit && (
          <button
            onClick={onExit}
            style={{
              padding: "10px 20px",
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Back to Quizzes
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <p style={{ textAlign: "center", color: "#cbd5e1", marginTop: "2rem" }}>
          No quizzes created yet
        </p>
      ) : (
        <div style={styles.moduleGroupsContainer}>
          {Object.entries(quizzesByModule).map(
            ([moduleName, moduleQuizzes]) => (
              <div key={moduleName} style={styles.moduleSection}>
                <h3 style={styles.moduleTitle}>{moduleName}</h3>
                <div style={styles.quizGrid}>
                  {moduleQuizzes.map((quiz) => (
                    <div key={quiz._id} style={styles.quizCard}>
                      <div style={styles.quizHeader}>
                        <div>
                          <span style={styles.badge}>{quiz.code}</span>
                          <p style={styles.quizTitle}>{quiz.title}</p>
                        </div>
                      </div>
                      <div style={styles.quizMetaInfo}>
                        <p>{quiz.questionCount} questions</p>
                        <p>
                          Created:{" "}
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </p>
                        <p>
                          {quiz.participantCount || 0} participant
                          {quiz.participantCount !== 1 ? "s" : ""}
                        </p>
                        {quiz.endedAt && (
                          <p style={{ color: "#10b981", fontWeight: "bold" }}>
                            ✓ Completed
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedQuiz(quiz)}
                        style={styles.button}
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {selectedQuiz && !showParticipantDetails && (
        <QuizDetailsModal
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onSelectParticipant={(participant) => {
            setSelectedParticipant(participant);
            setShowParticipantDetails(true);
          }}
          token={localStorage.getItem("auth_token") || ""}
          apiUrl={API_URL}
        />
      )}

      {showParticipantDetails && selectedParticipant && (
        <ParticipantDetailsModal
          participant={selectedParticipant}
          quiz={selectedQuiz!}
          onClose={() => {
            setShowParticipantDetails(false);
            setSelectedParticipant(null);
          }}
        />
      )}
    </div>
  );
}

interface QuizDetailsModalProps {
  quiz: Quiz;
  onClose: () => void;
  onSelectParticipant: (participant: ParticipantAnswers) => void;
  token: string;
  apiUrl: string;
}

function QuizDetailsModal({
  quiz,
  onClose,
  onSelectParticipant,
  token,
  apiUrl,
}: QuizDetailsModalProps) {
  const [participants, setParticipants] = useState<ParticipantAnswers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, []);

  async function fetchParticipants() {
    try {
      setLoading(true);
      const res = await fetch(
        `${apiUrl}/api/quizzes/${quiz.quizId}/responses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch responses");

      const data = await res.json();
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h3 style={{ color: "#f1f5f9", fontSize: "1.5rem" }}>{quiz.title}</h3>
        <p style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
          Code: {quiz.code}
        </p>

        {loading ? (
          <p style={{ color: "#cbd5e1" }}>Loading participants...</p>
        ) : (
          <div style={styles.participantTable}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableCell}>Participant Name</th>
                  <th style={styles.tableCell}>Score</th>
                  <th style={styles.tableCell}>Questions Answered</th>
                  <th style={styles.tableCell}>Time Taken</th>
                  <th style={styles.tableCell}>Suspicion Score</th>
                  <th style={styles.tableCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.playerId} style={styles.tableRow}>
                    <td style={styles.tableCell}>{participant.playerName}</td>
                    <td style={styles.tableCell}>{participant.score}</td>
                    <td style={styles.tableCell}>
                      {participant.answeredQuestions}
                    </td>
                    <td style={styles.tableCell}>
                      {participant.answers && participant.answers.length > 0
                        ? Math.round(
                            participant.answers.reduce(
                              (sum, a) => sum + a.timeTakenMs,
                              0,
                            ) / 1000,
                          ) + "s"
                        : "0s"}
                    </td>
                    <td
                      style={{
                        ...styles.tableCell,
                        color:
                          participant.suspicionScore > 5
                            ? "#ef4444"
                            : "#10b981",
                        fontWeight: "bold",
                      }}
                    >
                      {participant.suspicionScore.toFixed(1)}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => onSelectParticipant(participant)}
                        style={styles.linkButton}
                      >
                        View Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface ParticipantDetailsModalProps {
  participant: ParticipantAnswers;
  quiz: Quiz;
  onClose: () => void;
}

function ParticipantDetailsModal({
  participant,
  quiz,
  onClose,
}: ParticipantDetailsModalProps) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <h3 style={{ color: "#f1f5f9", fontSize: "1.5rem" }}>
          {participant.playerName} - {quiz.title}
        </h3>
        <div style={styles.participantStats}>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Score</p>
            <p style={styles.statValue}>{participant.score}</p>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Suspicion Score</p>
            <p
              style={{
                ...styles.statValue,
                color: participant.suspicionScore > 5 ? "#ef4444" : "#10b981",
              }}
            >
              {participant.suspicionScore.toFixed(1)}
            </p>
          </div>
          <div style={styles.statBox}>
            <p style={styles.statLabel}>Tab Switches</p>
            <p style={styles.statValue}>{participant.tabSwitchCount}</p>
          </div>
        </div>

        <h4 style={{ marginTop: "20px", color: "#f1f5f9" }}>Answer Details:</h4>
        <div style={styles.answersContainer}>
          {(participant.answers || []).map((answer, idx) => (
            <div key={idx} style={styles.answerCard}>
              <h5 style={{ color: "#a78bfa", marginBottom: "0.75rem" }}>
                Q{idx + 1}: {answer.questionText}
              </h5>
              <p style={{ color: "#cbd5e1" }}>
                <strong>Time Taken:</strong>{" "}
                {(answer.timeTakenMs / 1000).toFixed(1)}s
              </p>
              <p style={{ color: "#cbd5e1" }}>
                <strong>Submitted:</strong>{" "}
                {new Date(answer.submittedAt).toLocaleTimeString()}
              </p>
              <p style={{ color: "#cbd5e1" }}>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color: answer.correct ? "#10b981" : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {answer.correct ? "✓ Correct" : "✗ Incorrect"}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "2rem 1.5rem",
    backgroundColor: "transparent",
    minHeight: "100vh",
  } as React.CSSProperties,
  error: {
    color: "#ef4444",
    padding: "1rem",
    backgroundColor: "#7f1d1d",
    borderRadius: "8px",
    border: "1px solid #991b1b",
  } as React.CSSProperties,
  moduleGroupsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  moduleSection: {
    backgroundColor: "#1a1a3e",
    padding: "1.5rem",
    borderRadius: "12px",
    border: "1px solid #2d2d5e",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
  } as React.CSSProperties,
  moduleTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#a78bfa",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "2px solid #7c3aed",
  } as React.CSSProperties,
  quizGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1.5rem",
  } as React.CSSProperties,
  quizCard: {
    backgroundColor: "#2d2d5e",
    border: "1px solid #3d3d7a",
    borderRadius: "12px",
    padding: "1.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  quizHeader: {
    marginBottom: "1rem",
  } as React.CSSProperties,
  badge: {
    display: "inline-block",
    backgroundColor: "#7c3aed",
    color: "white",
    padding: "0.25rem 0.75rem",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "0.5rem",
  } as React.CSSProperties,
  quizTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#f1f5f9",
    margin: "0.5rem 0 0 0",
  } as React.CSSProperties,
  quizMetaInfo: {
    fontSize: "13px",
    color: "#cbd5e1",
    marginBottom: "1rem",
  } as React.CSSProperties,
  button: {
    width: "100%",
    padding: "0.75rem 1rem",
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  } as React.CSSProperties,
  linkButton: {
    padding: "0.4rem 0.8rem",
    backgroundColor: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s",
  } as React.CSSProperties,
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#1a1a3e",
    borderRadius: "12px",
    padding: "2rem",
    maxWidth: "900px",
    maxHeight: "80vh",
    overflowY: "auto" as const,
    position: "relative" as const,
    border: "1px solid #2d2d5e",
    color: "#e2e8f0",
  },
  closeButton: {
    position: "absolute" as const,
    top: "1rem",
    right: "1rem",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#a78bfa",
  } as React.CSSProperties,
  participantTable: {
    marginTop: "1.5rem",
    overflowX: "auto" as const,
  } as React.CSSProperties,
  tableHeader: {
    backgroundColor: "#0f0f23",
    borderBottom: "2px solid #2d2d5e",
  } as React.CSSProperties,
  tableRow: {
    borderBottom: "1px solid #2d2d5e",
  } as React.CSSProperties,
  tableCell: {
    padding: "0.75rem",
    textAlign: "left" as const,
    fontSize: "13px",
    color: "#cbd5e1",
  } as React.CSSProperties,
  participantStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    marginTop: "1rem",
  } as React.CSSProperties,
  statBox: {
    backgroundColor: "#0f0f23",
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "center" as const,
    border: "1px solid #2d2d5e",
  } as React.CSSProperties,
  statLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0 0 0.5rem 0",
  } as React.CSSProperties,
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#f1f5f9",
    margin: 0,
  } as React.CSSProperties,
  answersContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    marginTop: "1rem",
  } as React.CSSProperties,
  answerCard: {
    backgroundColor: "#2d2d5e",
    border: "1px solid #3d3d7a",
    borderRadius: "8px",
    padding: "1rem",
    color: "#e2e8f0",
  } as React.CSSProperties,
};
