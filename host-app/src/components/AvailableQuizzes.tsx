import React, { useState, useEffect } from "react";
import type { ClientMessage } from "@shared/index";

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

interface AvailableQuizzesProps {
  sendMessage: (message: ClientMessage) => void;
  userId?: string;
}

export function AvailableQuizzes({
  sendMessage,
  userId,
}: AvailableQuizzesProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:3003";

  useEffect(() => {
    fetchQuizzes();
  }, []);

  async function fetchQuizzes() {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_URL}/api/quizzes/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch quizzes");

      const data = await res.json();
      setQuizzes(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const handleStartQuiz = (quiz: Quiz) => {
    sendMessage({
      type: "host:join",
      quizCode: quiz.code,
      userId: userId || "",
    });
  };

  if (loading) {
    return (
      <div className="phase-container" style={styles.pageWrapper}>
        <h1 style={{ textAlign: "center" }}>Available Quizzes</h1>
        <p style={{ textAlign: "center", color: "#cbd5e1", marginTop: "2rem" }}>
          Loading quizzes...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="phase-container" style={styles.pageWrapper}>
        <h1 style={{ textAlign: "center" }}>Available Quizzes</h1>
        <div style={{ ...styles.error, marginTop: "2rem" }}>Error: {error}</div>
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
    <div className="phase-container" style={styles.pageWrapper}>
      <h1 style={{ textAlign: "center" }}>Available Quizzes</h1>

      {quizzes.length === 0 ? (
        <p style={{ textAlign: "center", color: "#cbd5e1", marginTop: "2rem" }}>
          No quizzes available right now
        </p>
      ) : (
        <div style={styles.moduleGroupsContainer}>
          {Object.entries(quizzesByModule)
            .sort(([a], [b]) => {
              const numA = parseInt(a.match(/\d+/)?.[0] || "0");
              const numB = parseInt(b.match(/\d+/)?.[0] || "0");
              return numA - numB;
            })
            .map(([moduleName, moduleQuizzes]) => (
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
                      </div>
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        style={styles.startButton}
                      >
                        Start Quiz
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  pageWrapper: {
    maxWidth: "100%",
    textAlign: "left" as const,
  },

  moduleGroupsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },

  moduleSection: {
    backgroundColor: "transparent",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "none",
  } as React.CSSProperties,

  moduleTitle: {
    color: "#a78bfa",
    fontSize: "1.3rem",
    marginBottom: "1rem",
    fontWeight: "600",
  } as React.CSSProperties,

  quizGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  } as React.CSSProperties,

  quizCard: {
    backgroundColor: "#1e1e4a",
    borderRadius: "8px",
    padding: "1.5rem",
    border: "1px solid #3d3d7a",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as React.CSSProperties,

  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  } as React.CSSProperties,

  badge: {
    backgroundColor: "#5b21b6",
    color: "#e9d5ff",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontWeight: "600",
  } as React.CSSProperties,

  quizTitle: {
    color: "#f1f5f9",
    fontSize: "1.2rem",
    fontWeight: "600",
    marginTop: "0.5rem",
  } as React.CSSProperties,

  quizMetaInfo: {
    color: "#cbd5e1",
    fontSize: "0.9rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  } as React.CSSProperties,

  startButton: {
    backgroundColor: "#a78bfa",
    color: "#0f172a",
    border: "none",
    padding: "0.75rem 1.5rem",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,

  error: {
    backgroundColor: "#7f1d1d",
    color: "#fca5a5",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #dc2626",
  } as React.CSSProperties,
};
