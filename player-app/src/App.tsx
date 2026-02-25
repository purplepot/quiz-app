// ============================================================
// Player App - Composant principal
// A IMPLEMENTER : gestion des messages et routage par phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import type { QuizPhase, QuizQuestion } from '@shared/index'
import JoinScreen from './components/JoinScreen'
import WaitingLobby from './components/WaitingLobby'
import AnswerScreen from './components/AnswerScreen'
import FeedbackScreen from './components/FeedbackScreen'
import ScoreScreen from './components/ScoreScreen'

const WS_URL = `ws://${window.location.hostname}:3001`

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'join' | 'feedback'>('join')
  const [playerName, setPlayerName] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'correctIndex'> | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    // TODO: Traiter chaque type de message du serveur
    // Utiliser un switch sur lastMessage.type

    switch (lastMessage.type) {
      case 'joined': {
        // Mettre a jour la liste des joueurs
        setPlayers(lastMessage.players)
        // Passer en phase 'lobby'
        setPhase('lobby')
        // Effacer les erreurs
        setError(undefined)
        break
      }

      case 'question': {
        // Mettre a jour currentQuestion avec lastMessage.question
        setCurrentQuestion(lastMessage.question)
        // Mettre a jour remaining avec lastMessage.question.timerSec
        setRemaining(lastMessage.question.timerSec)
        // Reinitialiser hasAnswered a false
        setHasAnswered(false)
        setSelectedChoice(null)
        // Changer la phase en 'question'
        setPhase('question')
        break
      }

      case 'tick': {
        // Mettre a jour remaining avec lastMessage.remaining
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        // Verifier si le joueur a repondu correctement
        const isCorrect = selectedChoice === lastMessage.correctIndex
        // (comparer la reponse du joueur avec lastMessage.correctIndex)
        setLastCorrect(isCorrect)
        // Mettre a jour lastCorrect (true/false)
        // Recuperer le score du joueur depuis lastMessage.scores
        setScore(lastMessage.scores[playerName] || 0)
        // Changer la phase en 'feedback'
        setPhase('feedback')
        break
      }

      case 'leaderboard': {
        // Mettre a jour rankings avec lastMessage.rankings
        setRankings(lastMessage.rankings)
        // Changer la phase en 'leaderboard'
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        // Changer la phase en 'ended'
        setPhase('ended')
        break
      }

      case 'error': {
        // Stocker le message d'erreur dans le state error
        setError(lastMessage.message)
        break
      }
    }
  }, [lastMessage])

  // --- Handlers ---

  /** Appele quand le joueur soumet le formulaire de connexion */
  const handleJoin = (code: string, name: string) => {
    // Sauvegarder le nom du joueur dans playerName
    setPlayerName(name)
    // Envoyer un message 'join' au serveur avec sendMessage
    //console.log("test :", code, name); 
    sendMessage({ type: 'join', quizCode: code, name })
  }

  /** Appele quand le joueur clique sur un choix de reponse */
  const handleAnswer = (choiceIndex: number) => {
    // Verifier que le joueur n'a pas deja repondu (hasAnswered)
    if (hasAnswered || !currentQuestion) return
    // Marquer hasAnswered a true
    setHasAnswered(true)
    setSelectedChoice(choiceIndex)
    // Envoyer un message 'answer' au serveur avec l'id de la question et le choiceIndex
    sendMessage({ type: 'answer', questionId: currentQuestion.id, choiceIndex })
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'join':
        return <JoinScreen onJoin={handleJoin} error={error} />

      case 'lobby':
        return <WaitingLobby players={players} />

      case 'question':
        return currentQuestion ? (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null

      case 'feedback':
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'results':
        // Pendant 'results' on reste sur FeedbackScreen
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'leaderboard':
        return <ScoreScreen rankings={rankings} playerName={playerName} />

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz termine !</h1>
            <p className="ended-message">Merci d'avoir participe !</p>
            <button className="btn-primary" onClick={() => setPhase('join')}>
              Rejoindre un autre quiz
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Player</h2>
        <span className={`status-badge status-${status}`}>
          {status === 'connected' ? 'Connecte' : status === 'connecting' ? 'Connexion...' : 'Deconnecte'}
        </span>
      </header>
      <main className="app-main">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App
