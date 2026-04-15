// ============================================================
// AnswerScreen - Colored answer buttons
// TO IMPLEMENT: question, timer, 4 colored buttons
// ============================================================

import { useState } from "react";
import type { QuizQuestion } from "@shared/index";

interface AnswerScreenProps {
  /** Current question (without correctIndex) */
  question: Omit<QuizQuestion, "correctIndex">;
  /** Remaining time in seconds */
  remaining: number;
  /** Callback when player clicks a choice */
  onAnswer: (choiceIndex: number) => void;
  /** If true, the player has already answered */
  hasAnswered: boolean;
}

/**
 * Component showing the question and colored answer buttons.
 *
 * What to implement:
 * - Remaining time (class .answer-timer)
 *   Add class .warning if remaining <= 10, .danger if remaining <= 3
 * - Question text (class .answer-question)
 * - 4 colored buttons in a grid (classes .answer-grid, .answer-btn)
 *   Colors are handled automatically by :nth-child in CSS
 * - All buttons are disabled if hasAnswered is true
 * - Optional: add .selected class to chosen button
 * - If the player answered, show "Answer submitted!" (class .answered-message)
 *
 * Available CSS classes: .answer-screen, .answer-timer, .warning, .danger,
 * .answer-question, .answer-grid, .answer-btn, .selected, .answered-message
 */
function AnswerScreen({
  question,
  remaining,
  onAnswer,
  hasAnswered,
}: AnswerScreenProps) {
  // Optional state to store selected choice index
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    // Call onAnswer(index)
    onAnswer(index);
    // Optional: store selected index for .selected style
    setSelectedIndex(index);
  };

  const timerClass = `answer-timer ${remaining <= 3 ? "danger" : remaining <= 10 ? "warning" : ""}`;

  return (
    <div className="answer-screen">
      {/* Timer with .answer-timer (+ .warning / .danger based on remaining) */}
      <div className={timerClass}>{remaining}s</div>

      {/* Question text with .answer-question */}
      <h2 className="answer-question">{question.text}</h2>

      {/* Grid of 4 buttons with .answer-grid and .answer-btn */}
      <div className="answer-grid">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            className={`answer-btn btn-${index} ${selectedIndex === index ? "selected" : ""}`}
            onClick={() => handleClick(index)}
            disabled={hasAnswered}
          >
            {choice}
          </button>
        ))}
      </div>

      {/* Message "Answer submitted!" if hasAnswered */}
      {hasAnswered && <p className="answered-message">Answer submitted!</p>}
    </div>
  );
}

export default AnswerScreen;
