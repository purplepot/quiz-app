// ============================================================
// Leaderboard - Classement des joueurs
// A IMPLEMENTER : liste triee avec scores
// ============================================================

interface LeaderboardProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
}

/**
 * Composant affichant le classement des joueurs.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Classement" (classe .leaderboard-title)
 * - Une liste ordonnee des joueurs (classe .leaderboard)
 * - Chaque joueur affiche (classe .leaderboard-item) :
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank
 *   - Son nom dans .leaderboard-name
 *   - Son score dans .leaderboard-score
 * - Les 3 premiers ont des styles speciaux via :nth-child (deja dans le CSS)
 *
 * Note : les rankings sont deja tries par score decroissant
 */

const MEDALS = ['🥇', '🥈', '🥉']

function Leaderboard({ rankings }: LeaderboardProps) {
  return (
    <div className="phase-container">

      {/* TODO: Titre "Classement" avec .leaderboard-title */}
      <h2 className="leaderboard-title" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Classement
      </h2>

      <div className="leaderboard">
        {/* TODO: Pour chaque joueur dans rankings, afficher un .leaderboard-item */}
        {rankings.map((player, i) => (
          <div key={player.name} className="leaderboard-item">

            {/* TODO: Afficher rang, nom et score */}
            <span className="leaderboard-rank">
              {i < 3 ? MEDALS[i] : i + 1}
            </span>

            <span className="leaderboard-name">{player.name}</span>

            <span className="leaderboard-score">{player.score} pts</span>

          </div>
        ))}

        {rankings.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '1rem' }}>
            Aucun joueur
          </p>
        )}
      </div>

    </div>
  )
}

export default Leaderboard
