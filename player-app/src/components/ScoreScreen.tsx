// ============================================================
// ScoreScreen - Leaderboard with player highlight
// TO IMPLEMENT: leaderboard with highlighted player
// ============================================================

import type { LeaderboardEntry } from "@shared/index";

interface ScoreScreenProps {
  /** Rankings sorted by descending score */
  rankings: LeaderboardEntry[];
  /** Current player name (to highlight it) */
  playerName: string;
  /** Callback when player wants to join another quiz */
  onExit?: () => void;
}

/**
 * Component displaying leaderboard with highlighted player position.
 *
 * What to implement:
 * - A "Leaderboard" title (class .leaderboard-title)
 * - Ordered list of players (class .leaderboard)
 * - Each player in a .leaderboard-item
 *   If it's the current player, also add class .is-me
 * - For each player display:
 *   - Rank (1, 2, 3...) in .leaderboard-rank
 *   - Name in .leaderboard-name
 *   - Score in .leaderboard-score
 *
 * Available CSS classes: .score-screen, .leaderboard-title, .leaderboard,
 * .leaderboard-item, .is-me, .leaderboard-rank, .leaderboard-name, .leaderboard-score
 */
function ScoreScreen({ rankings, playerName, onExit }: ScoreScreenProps) {
  return (
    <div className="phase-container score-screen">
      {/* "Leaderboard" title with .leaderboard-title */}
      <h1 className="leaderboard-title">Leaderboard</h1>

      <div className="leaderboard">
        {/* For each player in rankings, render a .leaderboard-item */}
        {/* Add .is-me class if ranking.name === playerName */}
        {rankings.map((ranking, index) => (
          <div
            key={ranking.id}
            className={`leaderboard-item ${ranking.name === playerName ? "is-me" : ""}`}
          >
            {/* Show rank, name, and score */}
            <span className="leaderboard-rank">
              {ranking.rank || index + 1}
            </span>
            <span className="leaderboard-name">{ranking.name}</span>
            <span className="leaderboard-score">{ranking.score} pts</span>
          </div>
        ))}
      </div>
      {onExit && (
        <button
          className="btn-primary"
          onClick={onExit}
          style={{ marginTop: "2rem" }}
        >
          Join another quiz
        </button>
      )}
    </div>
  );
}

export default ScoreScreen;
