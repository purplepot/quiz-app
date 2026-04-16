import React from "react";

interface LearnProps {
  onClose: () => void;
}

export function Learn({ onClose }: LearnProps) {
  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <h1 style={styles.title}>Cheating Detection System</h1>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>1. Concept Definition</h2>
          <p style={styles.text}>
            A <strong>behavioral analysis system</strong> that detects academic
            dishonesty in online quizzes by analyzing telemetry data (timing,
            focus, answer patterns) without requiring machine learning models or
            training datasets.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>2. How It Works (Step-by-Step)</h2>

          <div style={styles.step}>
            <h3 style={styles.stepTitle}>Step 1: Real-Time Data Collection</h3>
            <ul style={styles.list}>
              <li>Time taken to answer each question (timeTakenMs)</li>
              <li>Number of tab switches detected (tabSwitchCount)</li>
              <li>Browser focus state (focusedAtSubmit)</li>
              <li>Remaining time when answer submitted</li>
            </ul>
          </div>

          <div style={styles.step}>
            <h3 style={styles.stepTitle}>Step 2: Per-Answer Scoring</h3>
            <p style={styles.text}>
              Each answer is assigned a suspicion score (0-1) based on:
            </p>
            <ul style={styles.list}>
              <li>Too fast answer (&lt; 2000ms): +0.3</li>
              <li>Tab switching (per switch): +0.2 (max 0.6)</li>
              <li>Very early answer (&gt; 10 sec remaining): +0.2</li>
              <li>Fast + Correct (suspicious pattern): +0.3</li>
              <li>Unfocused submission: +0.1</li>
            </ul>
          </div>

          <div style={styles.step}>
            <h3 style={styles.stepTitle}>
              Step 3: Aggregate Statistical Analysis
            </h3>
            <p style={styles.text}>
              After all answers, analyze player-level patterns:
            </p>
            <ul style={styles.list}>
              <li>Average answer time</li>
              <li>Timing consistency (standard deviation)</li>
              <li>Overall accuracy percentage</li>
              <li>Ratio of fast &amp; correct answers</li>
              <li>Total tab switches across quiz</li>
            </ul>
          </div>

          <div style={styles.step}>
            <h3 style={styles.stepTitle}>Step 4: Pattern Detection</h3>
            <p style={styles.text}>
              Flag suspicious patterns like: "10/10 correct with all answers in
              &lt;2 seconds" = Impossible human performance
            </p>
          </div>

          <div style={styles.step}>
            <h3 style={styles.stepTitle}>Step 5: Comparative Analysis</h3>
            <p style={styles.text}>
              Compare players: If two players have identical answer sequences
              with matching timing = High collusion likelihood
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>3. Example Walkthrough</h2>
          <div style={styles.example}>
            <p style={styles.boldText}>Scenario: 3-question quiz</p>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Question</th>
                  <th style={styles.th}>Time (ms)</th>
                  <th style={styles.th}>Tabs</th>
                  <th style={styles.th}>Correct</th>
                  <th style={styles.th}>Suspicion</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={styles.td}>Q1</td>
                  <td style={styles.td}>1200</td>
                  <td style={styles.td}>0</td>
                  <td style={styles.td}>✓</td>
                  <td style={styles.td}>0.6 (too fast + correct)</td>
                </tr>
                <tr>
                  <td style={styles.td}>Q2</td>
                  <td style={styles.td}>900</td>
                  <td style={styles.td}>3</td>
                  <td style={styles.td}>✓</td>
                  <td style={styles.td}>0.8 (very fast + tabs + correct)</td>
                </tr>
                <tr>
                  <td style={styles.td}>Q3</td>
                  <td style={styles.td}>1500</td>
                  <td style={styles.td}>1</td>
                  <td style={styles.td}>✓</td>
                  <td style={styles.td}>0.5 (slightly fast)</td>
                </tr>
              </tbody>
            </table>
            <p style={styles.text}>
              <strong>Result:</strong> Cumulative suspicion = High → Player
              flagged
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>4. Purpose & Use Cases</h2>
          <ul style={styles.list}>
            <li>
              <strong>Online Education:</strong> Detect cheating in remote exams
            </li>
            <li>
              <strong>Certification Programs:</strong> Ensure test integrity
            </li>
            <li>
              <strong>Competitive Quizzes:</strong> Fair competition without
              manipulation
            </li>
            <li>
              <strong>Corporate Training:</strong> Validate learning outcomes
            </li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>5. Key Variables</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Variable</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Normal Range</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>timeTakenMs</td>
                <td style={styles.td}>Milliseconds to answer</td>
                <td style={styles.td}>2000-5000 ms</td>
              </tr>
              <tr>
                <td style={styles.td}>tabSwitchCount</td>
                <td style={styles.td}>Browser tab/window switches</td>
                <td style={styles.td}>0-2 per question</td>
              </tr>
              <tr>
                <td style={styles.td}>accuracy</td>
                <td style={styles.td}>% correct answers</td>
                <td style={styles.td}>40-70%</td>
              </tr>
              <tr>
                <td style={styles.td}>stdTime</td>
                <td style={styles.td}>Timing consistency variance</td>
                <td style={styles.td}>&gt;500 ms (natural variation)</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    overflowY: "auto",
    padding: "20px",
  },
  container: {
    backgroundColor: "#1a1a1a",
    borderRadius: "10px",
    padding: "40px",
    maxWidth: "900px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    color: "#e0e0e0",
  },
  closeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#bb86fc",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "20px",
    marginTop: "20px",
    marginBottom: "15px",
    color: "#bb86fc",
    borderBottom: "2px solid #bb86fc",
    paddingBottom: "10px",
  },
  section: {
    marginBottom: "30px",
  },
  step: {
    backgroundColor: "#2d2d2d",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
    borderLeft: "4px solid #bb86fc",
  },
  stepTitle: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#bb86fc",
  },
  text: {
    lineHeight: "1.6",
    color: "#e0e0e0",
    margin: "10px 0",
  },
  boldText: {
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#ffffff",
  },
  list: {
    marginLeft: "20px",
    lineHeight: "1.8",
    color: "#e0e0e0",
  },
  example: {
    backgroundColor: "#2d2d2d",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #bb86fc",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  th: {
    backgroundColor: "#bb86fc",
    color: "#1a1a1a",
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #444",
    color: "#e0e0e0",
  },
};
