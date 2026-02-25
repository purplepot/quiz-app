// ============================================================
// WaitingLobby - Ecran d'attente pour les joueurs
// A IMPLEMENTER : message d'attente et liste des joueurs
// ============================================================

interface WaitingLobbyProps {
  /** Liste des noms de joueurs connectes */
  players: string[]
}

/**
 * Composant ecran d'attente affiche cote joueur apres avoir rejoint.
 *
 * Ce qu'il faut implementer :
 * - Un message "En attente du host..." (classe .waiting-message)
 * - Le nombre de joueurs connectes
 * - La liste des joueurs (puces avec classe .player-chip dans un .player-list)
 *
 * Classes CSS disponibles : .waiting-container, .waiting-message,
 * .player-list, .player-chip
 */
function WaitingLobby({ players }: WaitingLobbyProps) {
  return (
    <div className="phase-container waiting-container">
      {/* Message "En attente du host..." avec .waiting-message */}
      <p className="waiting-message">En attente du host...</p>
      {/* Nombre de joueurs */}
      <p className="waiting-message">{players.length} joueur(s) connecté(s) !</p>
      {/* Liste des joueurs avec .player-list et .player-chip */}
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className="player-chip">
            {player}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default WaitingLobby
