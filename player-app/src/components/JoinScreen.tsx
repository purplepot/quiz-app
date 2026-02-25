// ============================================================
// JoinScreen - Formulaire pour rejoindre un quiz
// A IMPLEMENTER : champs code et nom, bouton rejoindre
// ============================================================

import { useState } from 'react'

interface JoinScreenProps {
  /** Callback appele quand le joueur soumet le formulaire */
  onJoin: (code: string, name: string) => void
  /** Message d'erreur optionnel (ex: "Code invalide") */
  error?: string
}

/**
 * Composant formulaire pour rejoindre un quiz existant.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le code du quiz (6 caracteres, majuscules)
 *   avec la classe .code-input pour le style monospace
 * - Un champ pour le pseudo du joueur
 * - Un bouton "Rejoindre" (classe .btn-primary)
 * - Afficher le message d'erreur s'il existe (classe .error-message)
 * - Valider que les deux champs ne sont pas vides avant d'appeler onJoin
 *
 * Classes CSS disponibles : .join-form, .form-group, .code-input,
 * .error-message, .btn-primary
 */
function JoinScreen({ onJoin, error }: JoinScreenProps) {
  // State pour le code du quiz
  // State pour le pseudo
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Valider que les champs ne sont pas vides
    // Appeler onJoin(code.toUpperCase(), name)
    if (code.trim() && name.trim()) {
      onJoin(code.toUpperCase().trim(), name.trim())
    }
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h1>Rejoindre un Quiz</h1>
      {/* Afficher l'erreur si elle existe */}
      {error && <p className="error-message">{error}</p>}
      {/* Champ code du quiz avec classe .code-input */}
      <div className="form-group">
        <label>Code du Quiz</label>
        <input type="text" maxLength={6} placeholder="Ex: LBJ236" className="code-input" value={code} onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      {/* Champ pseudo */}
      <div className="form-group">
        <label>Ton Pseudo</label>
        <input type="text" placeholder="Ex: Atu" value={name} onChange={(e) => setName(e.target.value)} required
        />
      </div>
      {/* Bouton Rejoindre */}
      <button type="submit" className="btn-primary">
        C'est parti !
      </button>
    </form>
  )
}

export default JoinScreen
