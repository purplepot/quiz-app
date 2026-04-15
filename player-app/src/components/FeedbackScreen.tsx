// ============================================================
// FeedbackScreen - Correct/incorrect feedback
// TO IMPLEMENT: icon and score
// ============================================================

interface FeedbackScreenProps {
  /** If true, the player answered correctly */
  correct: boolean;
  /** Player's current total score */
  score: number;
}

/**
 * Component showing feedback after a question (correct or incorrect).
 *
 * What to implement:
 * - A container with class .feedback and .correct or .incorrect based on result
 * - A large icon (class .feedback-icon)
 *   CSS automatically adds a check or X via ::after
 * - Text "Correct answer!" or "Wrong answer" (class .feedback-text)
 * - Player total score (class .feedback-score): "Score: 1500 pts"
 *
 * Available CSS classes: .feedback-container, .feedback, .correct, .incorrect,
 * .feedback-icon, .feedback-text, .feedback-score
 */
function FeedbackScreen({ correct, score }: FeedbackScreenProps) {
  return (
    <div className="phase-container feedback-container">
      {/* .feedback container with .correct or .incorrect */}
      <div className={`feedback ${correct ? "correct" : "incorrect"}`}>
        {/* Icon .feedback-icon */}
        <div className="feedback-icon"></div>
        {/* Text "Correct answer!" or "Wrong answer" */}
        <p className="feedback-text">
          {correct ? "Correct answer!" : "Wrong answer"}
        </p>
        {/* Score "Score: {score} pts" */}
        <p className="feedback-score">Score: {score} pts</p>
      </div>
    </div>
  );
}

export default FeedbackScreen;
