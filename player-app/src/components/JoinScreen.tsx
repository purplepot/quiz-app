// ============================================================
// JoinScreen - Form to join a quiz
// TO IMPLEMENT: code and name fields, join button
// ============================================================

import { useState } from "react";

interface JoinScreenProps {
  /** Callback called when player submits the form */
  onJoin: (code: string, name: string) => void;
  /** Optional error message (e.g. "Invalid code") */
  error?: string;
}

/**
 * Form component to join an existing quiz.
 *
 * What to implement:
 * - A field for quiz code (6 characters, uppercase)
 *   with class .code-input for monospace style
 * - A field for player nickname
 * - A "Join" button (class .btn-primary)
 * - Show error message if present (class .error-message)
 * - Validate both fields are non-empty before calling onJoin
 *
 * Available CSS classes: .join-form, .form-group, .code-input,
 * .error-message, .btn-primary
 */
function JoinScreen({ onJoin, error }: JoinScreenProps) {
  // State for quiz code
  // State for nickname
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate fields are not empty
    // Call onJoin(code.toUpperCase(), name)
    if (code.trim() && name.trim()) {
      onJoin(code.toUpperCase().trim(), name.trim());
    }
  };

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h1>Join a Quiz</h1>
      {/* Show error if present */}
      {error && <p className="error-message">{error}</p>}
      {/* Quiz code field with class .code-input */}
      <div className="form-group">
        <label>Quiz Code</label>
        <input
          type="text"
          maxLength={6}
          placeholder="Ex: LBJ236"
          className="code-input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      {/* Nickname field */}
      <div className="form-group">
        <label>Your Nickname</label>
        <input
          type="text"
          placeholder="Ex: Atu"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      {/* Join button */}
      <button type="submit" className="btn-primary">
        Let's go!
      </button>
    </form>
  );
}

export default JoinScreen;
