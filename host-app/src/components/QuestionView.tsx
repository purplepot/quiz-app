// ============================================================
// QuestionView - Affichage de la question en cours (cote host)
// A IMPLEMENTER : question, choix, timer, compteur de reponses
// ============================================================

import type { QuizQuestion } from '@shared/index'

interface QuestionViewProps {
  /** La question en cours (sans correctIndex) */
  question: Omit<QuizQuestion, 'correctIndex'>
  /** Index de la question (0-based) */
  index: number
  /** Nombre total de questions */
  total: number
  /** Temps restant en secondes */
  remaining: number
  /** Nombre de joueurs ayant repondu */
  answerCount: number
  /** Nombre total de joueurs */
  totalPlayers: number
}

/**
 * Composant affichant la question en cours sur l'ecran du host.
 *
 * Ce qu'il faut implementer :
 * - En-tete avec "Question X / Y" (classe .question-header)
 * - Le timer en cercle (classes .countdown, .countdown-circle)
 *   Ajouter la classe .warning si remaining <= 10, .danger si remaining <= 3
 * - Le texte de la question (classe .question-text)
 * - Les 4 choix dans une grille (classes .choices-grid, .choice-card)
 * - Le compteur de reponses "X / Y reponses" (classe .answer-counter)
 *
 * Note : cote host on affiche les choix mais sans interaction
 * (c'est purement visuel pour projeter au mur)
 */
function QuestionView({ question, index, total, remaining, answerCount, totalPlayers }: QuestionViewProps) {
  const timerClass = remaining <= 3 ? 'danger' : remaining <= 10 ? 'warning' : ''

  return (
    <div className="phase-container">

      {/* TODO: En-tete "Question {index + 1} / {total}" */}
      <div className="question-header">
        <span>Question {index + 1} / {total}</span>
        <span style={{ color: '#a78bfa', letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase' }}>
          {question.timerSec}s par question
        </span>
      </div>

      {/* TODO: Timer avec .countdown-circle (+ .warning / .danger selon remaining) */}
      <div className="countdown">
        <div className={`countdown-circle ${timerClass}`}>
          {remaining}
        </div>
      </div>

      {/* TODO: Texte de la question avec .question-text */}
      <div className="question-text" style={{
        borderLeft: '4px solid #7c3aed',
        paddingLeft: '1rem',
        textAlign: 'left',
      }}>
        {question.text}
      </div>

      {/* TODO: Grille des 4 choix avec .choices-grid et .choice-card */}
      <div className="choices-grid">
        {question.choices.map((choice, i) => (
          <div key={i} className="choice-card">
            {choice}
          </div>
        ))}
      </div>

      {/* TODO: Compteur "{answerCount} / {totalPlayers} reponses" */}
      <p className="answer-counter">
        {answerCount} / {totalPlayers} réponses
      </p>

    </div>
  )
}

export default QuestionView
