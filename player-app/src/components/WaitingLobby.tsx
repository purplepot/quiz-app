// ============================================================
// WaitingLobby - Waiting screen for players
// TO IMPLEMENT: waiting message and player list
// ============================================================

import type { PlayerSnapshot } from "@shared/index";

interface WaitingLobbyProps {
  /** List of connected player names */
  players: PlayerSnapshot[];
}

/**
 * Waiting-screen component shown on the player side after joining.
 *
 * What to implement:
 * - A "Waiting for host..." message (class .waiting-message)
 * - Number of connected players
 * - Player list (chips with class .player-chip inside .player-list)
 *
 * Available CSS classes: .waiting-container, .waiting-message,
 * .player-list, .player-chip
 */
function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      {/* Message "Waiting for host..." with .waiting-message */}
      <p className="waiting-message">Waiting for host...</p>
      {/* Number of players */}
      <p className="waiting-message">{players.length} player(s) connected!</p>
      {/* Player list with .player-list and .player-chip */}
      <ul className="player-list">
        {players.map((player) => (
          <li key={player.id} className="player-chip">
            {player.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WaitingLobby;
