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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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

  async function downloadQuiz(quiz: Quiz) {
    try {
      setDownloadingId(quiz._id);
      const token = localStorage.getItem("auth_token");

      console.log(
        `[Download] Fetching from: ${API_URL}/api/quizzes/${quiz.quizId}`,
      );
      console.log(`[Download] Token present: ${!!token}`);

      // Fetch full quiz data with questions
      const response = await fetch(`${API_URL}/api/quizzes/${quiz.quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(`[Download] Response status: ${response.status}`);
      console.log(`[Download] Response headers:`, response.headers);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch quiz (${response.status}). Please ensure the quiz was created by you.`,
        );
      }

      const responseText = await response.text();
      console.log(
        `[Download] Raw response (first 200 chars):`,
        responseText.substring(0, 200),
      );

      let quizData;
      try {
        quizData = JSON.parse(responseText);
      } catch (e) {
        console.error(`[Download] JSON parse error:`, e);
        throw new Error(
          `Invalid response from server. Expected JSON but got: ${responseText.substring(0, 100)}`,
        );
      }

      console.log("[Download] Quiz data received:", quizData);

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Quiz data is missing questions");
      }

      const questions = quizData.questions;
      console.log(`[Download] Processing ${questions.length} questions`);

      // Generate HTML document with questions and correct answers
      const questionsHTML = questions
        .map(
          (q: any, idx: number) => `
    <div class="question">
      <p><strong>Q${idx + 1}: ${q.questionText || q.question || "Question"}</strong></p>
      <div class="options">
        ${(q.choices || [])
          .map(
            (choice: string, choiceIdx: number) => `
          <div style="color: #666; padding: 10px 0; margin: 5px 0;">
            <strong>${String.fromCharCode(65 + choiceIdx)}.</strong> ${choice}
          </div>
        `,
          )
          .join("")}
      </div>
      <p style="margin-top: 15px; margin-bottom: 20px;"><strong>Answer: ${String.fromCharCode(65 + q.correctIndex)}. ${(q.choices || [])[q.correctIndex] || ""}</strong></p>
    </div>
  `,
        )
        .join("");

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${quiz.code} - ${quiz.title}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; color: #333; line-height: 1.6; }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #34495e; margin-top: 30px; border-left: 5px solid #3498db; padding-left: 10px; }
    .quiz-info { background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .quiz-info p { margin: 8px 0; }
    .question { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #3498db; border-radius: 3px; }
    .options { margin: 10px 0 10px 20px; }
    .option { padding: 10px 0; margin: 5px 0; }
    .correct { color: white; font-weight: bold; background-color: #27ae60; padding: 3px 8px; border-radius: 3px; display: inline-block; }
    .incorrect { color: #666; }
    .footer { margin-top: 50px; color: #7f8c8d; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px; }
  </style>
</head>
<body>
  <h1>${quiz.title}</h1>
  
  <div class="quiz-info">
    <p><strong>Quiz Code:</strong> ${quiz.code}</p>
    <p><strong>Module:</strong> ${quiz.moduleTitle}</p>
    <p><strong>Total Questions:</strong> ${questions.length}</p>
    <p><strong>Created:</strong> ${new Date(quiz.createdAt).toLocaleDateString()}</p>
  </div>

  <h2>Questions and Correct Answers</h2>
  ${questionsHTML}

  <div class="footer">
    <p>Downloaded on ${new Date().toLocaleString()}</p>
    <p>This document contains the quiz questions with correct answers marked in green.</p>
  </div>
</body>
</html>`;

      // Create blob and download as DOC
      const blob = new Blob([htmlContent], { type: "application/msword" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${quiz.code}_${Date.now()}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("[Download] Quiz download completed successfully");
    } catch (err) {
      console.error("[Download] Error:", err);
      alert(
        `Failed to download: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setDownloadingId(null);
    }
  }

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
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleStartQuiz(quiz)}
                          style={styles.startButton}
                        >
                          Start Quiz
                        </button>
                        <button
                          onClick={() => downloadQuiz(quiz)}
                          disabled={downloadingId === quiz._id}
                          style={{
                            ...styles.startButton,
                            backgroundColor:
                              downloadingId === quiz._id
                                ? "#9ca3af"
                                : "#10b981",
                            cursor:
                              downloadingId === quiz._id
                                ? "not-allowed"
                                : "pointer",
                            opacity: downloadingId === quiz._id ? 0.6 : 1,
                          }}
                        >
                          {downloadingId === quiz._id
                            ? "Downloading..."
                            : "⬇ Download"}
                        </button>
                      </div>
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

  error: {
    backgroundColor: "#7f1d1d",
    color: "#fca5a5",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #dc2626",
  } as React.CSSProperties,

  quizMetaInfo: {
    color: "#cbd5e1",
    fontSize: "0.95rem",
  } as React.CSSProperties,

  startButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.3s",
  } as React.CSSProperties,
};
