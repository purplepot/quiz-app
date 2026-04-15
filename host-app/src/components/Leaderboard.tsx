// ============================================================
// Leaderboard - Player rankings
// TO IMPLEMENT: sorted list with scores
// ============================================================

import type { LeaderboardEntry } from "@shared/index";

interface LeaderboardProps {
  /** Rankings sorted by descending score */
  rankings: LeaderboardEntry[];
  /** Callback to exit the leaderboard */
  onExit?: () => void;
}

/**
 * Component showing player rankings.
 *
 * What to implement:
 * - A "Leaderboard" title (class .leaderboard-title)
 * - An ordered list of players (class .leaderboard)
 * - Each player shows (class .leaderboard-item):
 *   - Rank (1, 2, 3...) in .leaderboard-rank
 *   - Name in .leaderboard-name
 *   - Score in .leaderboard-score
 * - Top 3 have special styles via :nth-child (already in CSS)
 *
 * Note: rankings are already sorted by descending score
 */

const MEDALS = ["🥇", "🥈", "🥉"];

function Leaderboard({ rankings, onExit }: LeaderboardProps) {
  return (
    <div className="phase-container">
      {/* TODO: "Leaderboard" title with .leaderboard-title */}
      <h2
        className="leaderboard-title"
        style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        Leaderboard
      </h2>

      <div className="leaderboard">
        {/* TODO: For each player in rankings, render a .leaderboard-item */}
        {rankings.map((player, i) => (
          <div key={player.id} className="leaderboard-item">
            {/* TODO: Show rank, name, and score */}
            <span className="leaderboard-rank">
              {i < 3 ? MEDALS[i] : player.rank}
            </span>

            <span className="leaderboard-name">{player.name}</span>

            <span className="leaderboard-score">{player.score} pts</span>
          </div>
        ))}

        {rankings.length === 0 && (
          <p
            style={{ textAlign: "center", color: "#94a3b8", marginTop: "1rem" }}
          >
            No players
          </p>
        )}
      </div>

      {onExit && (
        <button
          onClick={onExit}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          Back to Quizzes
        </button>
      )}
    </div>
  );
}

export default Leaderboard;
