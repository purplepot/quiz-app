// ============================================================
// CreateQuiz - Quiz creation form with module selection & scheduling
// ============================================================

import type { QuizQuestion } from "@shared/index";
import { useState } from "react";
import { MODULES } from "../constants/modules";

interface CreateQuizProps {
  /** Callback called when the form is submitted */
  onSubmit: (questions: QuizQuestion[], moduleId: number) => void;
}

/**
 * Form component to create a new quiz with module selection and scheduling.
 *
 * Features:
 * - Module selection (dropdown from predefined modules)
 * - Quiz title field
 * - Scheduled start time (date + time picker)
 * - Dynamic list of questions (add/remove)
 * - For each question:
 *   - Text field for the question
 *   - 4 text fields for answer choices
 *   - Selector (radio) for the correct answer (correctIndex)
 *   - Field for timer duration in seconds
 * - Button to add a question
 * - Button to submit the form
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
  const [moduleId, setModuleId] = useState<number>(1);
  const [questions, setQuestions] = useState<DraftQuestion[]>([
    createEmptyQuestion(),
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate module selection
    if (!moduleId) {
      alert("Please select a module.");
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      alert("Add at least one question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Question ${i + 1}: prompt is empty.`);
        return;
      }
      if (q.choices.some((c) => !c.trim())) {
        alert(`Question ${i + 1}: all choices must be filled in.`);
        return;
      }
    }

    // Call onSubmit with required data
    onSubmit(questions, moduleId);
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
      <h1>Create a Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        {/* Module Selection */}
        <div className="form-group">
          <label htmlFor="module-select">Select Module *</label>
          <select
            id="module-select"
            value={moduleId}
            onChange={(e) => setModuleId(Number(e.target.value))}
            style={{
              padding: "0.5rem",
              fontSize: "1rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "100%",
            }}
          >
            <option value="">-- Choose a module --</option>
            {MODULES.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        {/* TODO: List questions with .question-card */}
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
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Prompt</label>
              <input
                type="text"
                placeholder="e.g. Which planet is closest to the sun?"
                value={q.text}
                onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Choices - select the correct answer</label>
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
                      placeholder={`Choice ${CHOICE_LABELS[ci]}`}
                      value={choice}
                      onChange={(e) => updateChoice(q.id, ci, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Timer duration (seconds)</label>
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

        {/* TODO: Add-question button */}
        <button
          type="button"
          className="btn-add-question"
          onClick={addQuestion}
        >
          + Add a question
        </button>

        {/* TODO: Submit button */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button type="submit" className="btn-primary">
            Submit Quiz
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateQuiz;
