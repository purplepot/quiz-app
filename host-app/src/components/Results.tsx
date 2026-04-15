// ============================================================
// Results - Display question results
// TO IMPLEMENT: animated bars and correct answer
// ============================================================

interface ResultsProps {
  /** Correct answer index (0-3) */
  correctIndex: number;
  /** Answer distribution [count_choice_0, count_choice_1, count_choice_2, count_choice_3] */
  distribution: number[];
  /** Choice labels */
  choices: string[];
  /** Callback when host clicks "Next question" */
  onNext: () => void;
}

/**
 * Component displaying results for a question with animated bars.
 *
 * What to implement:
 * - A "Results" title
 * - For each choice, a horizontal bar proportional to number of answers
 *   (classes .result-bar-container, .result-bar-label, .result-bar-wrapper, .result-bar)
 *   The correct bar has class .correct, others .incorrect
 *   Show label "(Correct answer)" next to the correct choice (class .correct-label)
 * - Bar width is proportional:
 *   width = `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`
 * - A "Next question" button (class .btn-primary)
 *
 * Tip: const maxCount = Math.max(...distribution, 1)
 */

const CHOICE_COLORS = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"];
const CHOICE_LABELS = ["A", "B", "C", "D"];

function Results({
  correctIndex,
  distribution,
  choices,
  onNext,
}: ResultsProps) {
  // TODO: Calculate proportional width for each bar
  const maxCount = Math.max(...distribution, 1);

  return (
    <div className="phase-container">
      <div className="results-container">
        <h1>Results</h1>

        {/* TODO: For each choice, show a result bar */}
        {choices.map((choice, i) => {
          const count = distribution[i] ?? 0;
          const width = `${(count / maxCount) * 100}%`;
          const isCorrect = i === correctIndex;

          return (
            <div key={i} style={{ marginBottom: "0.75rem" }}>
              {/* TODO: Show correct-answer label above */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.25rem",
                }}
              >
                <span
                  style={{
                    color: CHOICE_COLORS[i],
                    fontWeight: 700,
                    fontSize: "0.95rem",
                  }}
                >
                  {CHOICE_LABELS[i]} — {choice}
                </span>
                {isCorrect && (
                  <span className="correct-label">✓ Correct answer</span>
                )}
              </div>

              <div className="result-bar-container" style={{ marginBottom: 0 }}>
                <div className="result-bar-wrapper">
                  {/* TODO: Use .result-bar.correct for the correct answer */}
                  <div
                    className={`result-bar ${isCorrect ? "correct" : "incorrect"}`}
                    style={{
                      width,
                      background: isCorrect ? "#10b981" : CHOICE_COLORS[i],
                    }}
                  >
                    {/* TODO: Display number of answers in each bar */}
                    <span className="result-bar-count">{count}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* TODO: "Next question" button */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button className="btn-primary" onClick={onNext}>
            Next question -&gt;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
