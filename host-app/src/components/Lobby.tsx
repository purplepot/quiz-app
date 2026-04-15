// ============================================================
// Lobby - Waiting room before quiz
// TO IMPLEMENT: show code and player list
// ============================================================

import type { PlayerSnapshot } from "@shared/index";

interface LobbyProps {
  /** Quiz code to display so players can join */
  quizCode: string;
  /** List of connected player names */
  players: PlayerSnapshot[];
  /** Callback when host clicks "Start" */
  onStart: () => void;
}

/**
 * Waiting room component shown on host side.
 *
 * What to implement:
 * - Quiz code displayed in large text (class .quiz-code) with label "Quiz code"
 * - Number of connected players
 * - Player list (chips with class .player-chip in .player-list)
 * - A "Start quiz" button (class .btn-start)
 *   disabled if there are no players
 *
 * Available CSS classes: .phase-container, .quiz-code-label, .quiz-code,
 * .player-count, .player-list, .player-chip, .btn-start
 */
function Lobby({ quizCode, players, onStart }: LobbyProps) {
  return (
    <div className="phase-container">
      {/* TODO: Label "Quiz code" with class .quiz-code-label */}
      <p className="quiz-code-label">Quiz code</p>

      {/* TODO: Display quizCode with class .quiz-code */}
      <div className="quiz-code">{quizCode}</div>

      {/* TODO: Display player count */}
      <p className="player-count">
        {players.length} player{players.length !== 1 ? "s" : ""} connected
        {players.length !== 1 ? "s" : ""}
      </p>

      {/* TODO: Player list with .player-list and .player-chip */}
      <div className="player-list">
        {players.map((player) => (
          <span key={player.id} className="player-chip">
            {player.name}
          </span>
        ))}
      </div>

      {/* TODO: Start button with class .btn-start, disabled if 0 players */}
      <button
        className="btn-start"
        onClick={onStart}
        disabled={players.length === 0}
      >
        Start quiz
      </button>
    </div>
  );
}

export default Lobby;
