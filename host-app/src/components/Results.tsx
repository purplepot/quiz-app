// ============================================================
// Results - Affichage des resultats d'une question
// A IMPLEMENTER : barres animees et bonne reponse
// ============================================================

interface ResultsProps {
  /** Index de la bonne reponse (0-3) */
  correctIndex: number
  /** Distribution des reponses [nb_choix_0, nb_choix_1, nb_choix_2, nb_choix_3] */
  distribution: number[]
  /** Texte des choix de reponse */
  choices: string[]
  /** Callback quand le host clique sur "Question suivante" */
  onNext: () => void
}

/**
 * Composant affichant les resultats d'une question avec des barres animees.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Resultats"
 * - Pour chaque choix, une barre horizontale proportionnelle au nombre de reponses
 *   (classes .result-bar-container, .result-bar-label, .result-bar-wrapper, .result-bar)
 *   La barre correcte a la classe .correct, les autres .incorrect
 *   Afficher un label "(Bonne reponse)" a cote du bon choix (classe .correct-label)
 * - La largeur de la barre est proportionnelle :
 *   width = `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`
 * - Un bouton "Question suivante" (classe .btn-primary)
 *
 * Astuce : const maxCount = Math.max(...distribution, 1)
 */

const CHOICE_COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c']
const CHOICE_LABELS = ['A', 'B', 'C', 'D']

function Results({ correctIndex, distribution, choices, onNext }: ResultsProps) {
  // TODO: Calculer la largeur proportionnelle de chaque barre
  const maxCount = Math.max(...distribution, 1)

  return (
    <div className="phase-container">
      <div className="results-container">
        <h1>Résultats</h1>

        {/* TODO: Pour chaque choix, afficher une barre de resultat */}
        {choices.map((choice, i) => {
          const count = distribution[i] ?? 0
          const width = `${(count / maxCount) * 100}%`
          const isCorrect = i === correctIndex

          return (
            <div key={i} style={{ marginBottom: '0.75rem' }}>

              {/* TODO: Afficher le label bonne reponse au dessus */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: CHOICE_COLORS[i], fontWeight: 700, fontSize: '0.95rem' }}>
                  {CHOICE_LABELS[i]} — {choice}
                </span>
                {isCorrect && <span className="correct-label">✓ Bonne réponse</span>}
              </div>

              <div className="result-bar-container" style={{ marginBottom: 0 }}>
                <div className="result-bar-wrapper">
                  {/* TODO: Utiliser .result-bar.correct pour la bonne reponse */}
                  <div
                    className={`result-bar ${isCorrect ? 'correct' : 'incorrect'}`}
                    style={{ width, background: isCorrect ? '#10b981' : CHOICE_COLORS[i] }}
                  >
                    {/* TODO: Afficher le nombre de reponses dans chaque barre */}
                    <span className="result-bar-count">{count}</span>
                  </div>
                </div>
              </div>

            </div>
          )
        })}

        {/* TODO: Bouton "Question suivante" */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="btn-primary"
            onClick={onNext}
          >
            Question suivante →
          </button>
        </div>

      </div>
    </div>
  )
}

export default Results
