// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import type { QuizQuestion } from "@shared/index";
import { useState } from "react";

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void;
}

/**
 * Composant formulaire pour creer un nouveau quiz.
 *
 * Ce qu'il faut implementer : W
 * - Un champ pour le titre du quiz W
 * - Une liste dynamique de questions (pouvoir en ajouter/supprimer) W
 * - Pour chaque question :
 *   - Un champ texte pour la question W
 *   - 4 champs texte pour les choix de reponse W
 *   - Un selecteur (radio) pour la bonne reponse (correctIndex) W
 *   - Un champ pour la duree du timer en secondes W
 * - Un bouton pour ajouter une question W
 * - Un bouton pour soumettre le formulaire W
 *
 * Astuce : utilisez un state pour stocker un tableau de questions
 * et generez un id unique pour chaque question (ex: crypto.randomUUID())
 *
 * Classes CSS disponibles : .create-form, .form-group, .question-card,
 * .question-card-header, .choices-inputs, .choice-input-group,
 * .btn-add-question, .btn-remove, .btn-primary
 */

interface DraftQuestion {
  id: string;
  text: string;
  choices: [string, string, string, string];
  correctIndex: number;
  timerSec: number;
}

function createEmptyQuestion(): DraftQuestion {
  return {
    id: crypto.randomUUID(),
    text: "",
    choices: ["", "", "", ""],
    correctIndex: 0,
    timerSec: 30,
  };
}

const CHOICE_COLORS = ["#e21b3c", "#1368ce", "#d89e00", "#26890c"];
const CHOICE_LABELS = ["A", "B", "C", "D"];

function CreateQuiz({ onSubmit }: CreateQuizProps) {
  // TODO: State pour le titre
  const [title, setTitle] = useState("");
  // TODO: State pour la liste des questions
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    createEmptyQuestion(),
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Valider que le titre n'est pas vide
    if (!title.trim()) {
      alert("Le titre du quiz ne peut pas être vide.");
      return;
    }
    // TODO: Valider qu'il y a au moins 1 question
    if (questions.length === 0) {
      alert("Ajoutez au moins une question.");
      return;
    }
    // TODO: Valider que chaque question a un texte et 4 choix non-vides
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1} : l'intitulé est vide.`);
        return;
      }
      if (q.choices.some((c) => !c.trim())) {
        alert(`Question ${i + 1} : tous les choix doivent être remplis.`);
        return;
      }
    }
    // TODO: Appeler onSubmit(title, questions)
    onSubmit(title, questions);
    console.log(title, questions);
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...patch } : q)),
    );
  };

  const updateChoice = (id: string, choiceIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const newChoices = [...q.choices] as [string, string, string, string];
        newChoices[choiceIndex] = value;
        return { ...q, choices: newChoices };
      }),
    );
  };

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        {/* TODO: Champ titre */}
        <div className="form-group">
          <label htmlFor="quiz-title">Titre du Quiz</label>
          <input
            id="quiz-title"
            type="text"
            placeholder="Ex: Culture generale spatiale"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* TODO: Liste des questions avec .question-card */}
        {questions.map((q, idx) => (
          <div className="question-card" key={q.id}>
            <div className="question-card-header">
              <h3>Question {idx + 1}</h3>
              {questions.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeQuestion(q.id)}
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Intitule</label>
              <input
                type="text"
                placeholder="Ex: Quelle planete est la plus proche du soleil ?"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Choix — cochez la bonne reponse</label>
              <div className="choices-inputs">
                {q.choices.map((choice, ci) => (
                  <div className="choice-input-group" key={ci}>
                    <input
                      type="radio"
                      name={`correct-${q.id}`}
                      checked={q.correctIndex === ci}
                      onChange={() =>
                        updateQuestion(q.id, { correctIndex: ci })
                      }
                    />
                    <span
                      style={{
                        color: CHOICE_COLORS[ci],
                        fontWeight: 700,
                        minWidth: "16px",
                      }}
                    >
                      {CHOICE_LABELS[ci]}
                    </span>
                    <input
                      type="text"
                      placeholder={`Choix ${CHOICE_LABELS[ci]}`}
                      value={choice}
                      onChange={(e) => updateChoice(q.id, ci, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Duree du timer (secondes)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={q.timerSec}
                onChange={(e) =>
                  updateQuestion(q.id, { timerSec: Number(e.target.value) })
                }
              />
            </div>
          </div>
        ))}

        {/* TODO: Bouton ajouter une question */}
        <button
          type="button"
          className="btn-add-question"
          onClick={addQuestion}
        >
          + Ajouter une question
        </button>

        {/* TODO: Bouton soumettre */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button type="submit" className="btn-primary">
            Soumettre le Quiz
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;
