// ============================================================
// QuestionView - Display current question (host side)
// TO IMPLEMENT: question, choices, timer, answer counter
// ============================================================

import type { QuizQuestion } from "@shared/index";

interface QuestionViewProps {
  /** Current question (without correctIndex) */
  question: Omit<QuizQuestion, "correctIndex">;
  /** Question index (0-based) */
  index: number;
  /** Total number of questions */
  total: number;
  /** Remaining time in seconds */
  remaining: number;
  /** Number of players who answered */
  answerCount: number;
  /** Total number of players */
  totalPlayers: number;
}

/**
 * Component that displays the current question on the host screen.
 *
 * What to implement:
 * - Header with "Question X / Y" (class .question-header)
 * - Circular timer (classes .countdown, .countdown-circle)
 *   Add class .warning if remaining <= 10, .danger if remaining <= 3
 * - Question text (class .question-text)
 * - 4 choices in a grid (classes .choices-grid, .choice-card)
 * - Answer counter "X / Y answers" (class .answer-counter)
 *
 * Note: on the host side, choices are displayed without interaction
 * (purely visual for projection)
 */
function QuestionView({
  question,
  index,
  total,
  remaining,
  answerCount,
  totalPlayers,
}: QuestionViewProps) {
  const timerClass =
    remaining <= 3 ? "danger" : remaining <= 10 ? "warning" : "";

  return (
    <div className="phase-container">
      {/* TODO: Header "Question {index + 1} / {total}" */}
      <div className="question-header">
        <span>
          Question {index + 1} / {total}
        </span>
        <span
          style={{
            color: "#a78bfa",
            letterSpacing: "0.1em",
            fontSize: "0.8rem",
            textTransform: "uppercase",
          }}
        >
          {question.timerSec}s per question
        </span>
      </div>

      {/* TODO: Timer with .countdown-circle (+ .warning / .danger based on remaining) */}
      <div className="countdown">
        <div className={`countdown-circle ${timerClass}`}>{remaining}</div>
      </div>

      {/* TODO: Question text with .question-text */}
      <div
        className="question-text"
        style={{
          borderLeft: "4px solid #7c3aed",
          paddingLeft: "1rem",
          textAlign: "left",
        }}
      >
        {question.text}
      </div>

      {/* TODO: Grid of 4 choices with .choices-grid and .choice-card */}
      <div className="choices-grid">
        {question.choices.map((choice, i) => (
          <div key={i} className="choice-card">
            {choice}
          </div>
        ))}
      </div>

      {/* TODO: Counter "{answerCount} / {totalPlayers} answers" */}
      <p className="answer-counter">
        {answerCount} / {totalPlayers} answers
      </p>
    </div>
  );
}

export default QuestionView;
