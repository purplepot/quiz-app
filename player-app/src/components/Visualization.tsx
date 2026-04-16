import React, { useState } from "react";

interface VisualizationProps {
  onClose: () => void;
}

interface DemoAnswer {
  questionNum: number;
  time: number;
  tabs: number;
  correct: boolean;
  timingSuspicion: number;
  tabSuspicion: number;
  correctnessSuspicion: number;
  totalSuspicion: number;
}

export function Visualization({ onClose }: VisualizationProps) {
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const demoScenarios = [
    {
      title: "Normal Student (Honest)",
      description: "Varied timing, few tab switches, realistic accuracy",
      answers: [
        {
          questionNum: 1,
          time: 3200,
          tabs: 0,
          correct: true,
          timingSuspicion: 0,
          tabSuspicion: 0,
          correctnessSuspicion: 0,
          totalSuspicion: 0,
        },
        {
          questionNum: 2,
          time: 2800,
          tabs: 1,
          correct: false,
          timingSuspicion: 0.1,
          tabSuspicion: 0.2,
          correctnessSuspicion: 0,
          totalSuspicion: 0.15,
        },
        {
          questionNum: 3,
          time: 4100,
          tabs: 0,
          correct: true,
          timingSuspicion: 0,
          tabSuspicion: 0,
          correctnessSuspicion: 0,
          totalSuspicion: 0,
        },
        {
          questionNum: 4,
          time: 3500,
          tabs: 0,
          correct: true,
          timingSuspicion: 0,
          tabSuspicion: 0,
          correctnessSuspicion: 0,
          totalSuspicion: 0,
        },
        {
          questionNum: 5,
          time: 2900,
          tabs: 0,
          correct: false,
          timingSuspicion: 0.1,
          tabSuspicion: 0,
          correctnessSuspicion: 0,
          totalSuspicion: 0.1,
        },
      ] as DemoAnswer[],
      verdict: "✅ PASSED - Low suspicion (0.06 avg)",
      color: "#28a745",
    },
    {
      title: "Suspicious Student (Cheating Detected)",
      description: "Very fast answers, high tab switches, perfect accuracy",
      answers: [
        {
          questionNum: 1,
          time: 800,
          tabs: 2,
          correct: true,
          timingSuspicion: 0.6,
          tabSuspicion: 0.4,
          correctnessSuspicion: 0.3,
          totalSuspicion: 0.77,
        },
        {
          questionNum: 2,
          time: 650,
          tabs: 3,
          correct: true,
          timingSuspicion: 0.6,
          tabSuspicion: 0.6,
          correctnessSuspicion: 0.3,
          totalSuspicion: 0.83,
        },
        {
          questionNum: 3,
          time: 750,
          tabs: 2,
          correct: true,
          timingSuspicion: 0.6,
          tabSuspicion: 0.4,
          correctnessSuspicion: 0.3,
          totalSuspicion: 0.77,
        },
        {
          questionNum: 4,
          time: 700,
          tabs: 3,
          correct: true,
          timingSuspicion: 0.6,
          tabSuspicion: 0.6,
          correctnessSuspicion: 0.3,
          totalSuspicion: 0.83,
        },
        {
          questionNum: 5,
          time: 600,
          tabs: 4,
          correct: true,
          timingSuspicion: 0.6,
          tabSuspicion: 0.6,
          correctnessSuspicion: 0.3,
          totalSuspicion: 0.83,
        },
      ] as DemoAnswer[],
      verdict: "⚠️ FLAGGED - Critical suspicion (0.81 avg)",
      color: "#dc3545",
    },
    {
      title: "Borderline Case (Needs Review)",
      description: "Fast but not extreme, some tab switches, good accuracy",
      answers: [
        {
          questionNum: 1,
          time: 1900,
          tabs: 1,
          correct: true,
          timingSuspicion: 0.3,
          tabSuspicion: 0.2,
          correctnessSuspicion: 0.15,
          totalSuspicion: 0.35,
        },
        {
          questionNum: 2,
          time: 1700,
          tabs: 2,
          correct: true,
          timingSuspicion: 0.4,
          tabSuspicion: 0.4,
          correctnessSuspicion: 0.15,
          totalSuspicion: 0.55,
        },
        {
          questionNum: 3,
          time: 2100,
          tabs: 0,
          correct: true,
          timingSuspicion: 0.2,
          tabSuspicion: 0,
          correctnessSuspicion: 0.15,
          totalSuspicion: 0.25,
        },
        {
          questionNum: 4,
          time: 1800,
          tabs: 1,
          correct: true,
          timingSuspicion: 0.3,
          tabSuspicion: 0.2,
          correctnessSuspicion: 0.15,
          totalSuspicion: 0.35,
        },
        {
          questionNum: 5,
          time: 2200,
          tabs: 0,
          correct: false,
          timingSuspicion: 0,
          tabSuspicion: 0,
          correctnessSuspicion: 0,
          totalSuspicion: 0,
        },
      ] as DemoAnswer[],
      verdict: "⚠️ REVIEW - Moderate suspicion (0.30 avg)",
      color: "#ffc107",
    },
  ];

  const currentScenario = demoScenarios[selectedDemoIndex];
  const avgSuspicion =
    currentScenario.answers.reduce((sum, a) => sum + a.totalSuspicion, 0) /
    currentScenario.answers.length;

  const getSuspicionColor = (score: number) => {
    if (score < 0.3) return "#28a745";
    if (score < 0.6) return "#ffc107";
    return "#dc3545";
  };

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };

  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <h1 style={styles.title}>Interactive Visualization</h1>
        <p style={styles.subtitle}>
          See how the suspicion scoring system works in real-time
        </p>

        <div style={styles.scenarioSelector}>
          {demoScenarios.map((scenario, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDemoIndex(idx)}
              style={{
                ...styles.scenarioBtn,
                backgroundColor:
                  selectedDemoIndex === idx ? scenario.color : "#f0f0f0",
                color: selectedDemoIndex === idx ? "white" : "#333",
              }}
            >
              {scenario.title}
            </button>
          ))}
        </div>

        <div
          style={{
            ...styles.scenarioBox,
            borderColor: currentScenario.color,
          }}
        >
          <h2 style={styles.scenarioTitle}>{currentScenario.title}</h2>
          <p style={styles.scenarioDesc}>{currentScenario.description}</p>

          <div
            style={{
              ...styles.verdictBox,
              backgroundColor: currentScenario.color,
            }}
          >
            <p style={styles.verdictText}>{currentScenario.verdict}</p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <h3 style={styles.tableTitle}>Answer Breakdown</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Q#</th>
                <th style={styles.th}>Time (s)</th>
                <th style={styles.th}>Tab Switches</th>
                <th style={styles.th}>Correct?</th>
                <th style={styles.th}>Timing Score</th>
                <th style={styles.th}>Tab Score</th>
                <th style={styles.th}>Correct Score</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {currentScenario.answers.map((answer) => (
                <tr key={answer.questionNum}>
                  <td style={styles.td}>Q{answer.questionNum}</td>
                  <td style={styles.td}>{formatTime(answer.time)}</td>
                  <td style={styles.td}>{answer.tabs}</td>
                  <td style={styles.td}>{answer.correct ? "✓" : "✗"}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.score,
                        backgroundColor: getSuspicionColor(
                          answer.timingSuspicion,
                        ),
                      }}
                    >
                      {answer.timingSuspicion.toFixed(2)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.score,
                        backgroundColor: getSuspicionColor(answer.tabSuspicion),
                      }}
                    >
                      {answer.tabSuspicion.toFixed(2)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.score,
                        backgroundColor: getSuspicionColor(
                          answer.correctnessSuspicion,
                        ),
                      }}
                    >
                      {answer.correctnessSuspicion.toFixed(2)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.score,
                        backgroundColor: getSuspicionColor(
                          answer.totalSuspicion,
                        ),
                        fontWeight: "bold",
                      }}
                    >
                      {answer.totalSuspicion.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.statsBox}>
          <h3 style={styles.statsTitle}>Summary Statistics</h3>
          <div style={styles.stats}>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Average Suspicion</p>
              <p
                style={{
                  ...styles.statValue,
                  color: getSuspicionColor(avgSuspicion),
                }}
              >
                {avgSuspicion.toFixed(2)}
              </p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Accuracy</p>
              <p style={styles.statValue}>
                {(
                  (currentScenario.answers.filter((a) => a.correct).length /
                    currentScenario.answers.length) *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Total Tab Switches</p>
              <p style={styles.statValue}>
                {currentScenario.answers.reduce((sum, a) => sum + a.tabs, 0)}
              </p>
            </div>
            <div style={styles.stat}>
              <p style={styles.statLabel}>Avg Time/Question</p>
              <p style={styles.statValue}>
                {(
                  currentScenario.answers.reduce((sum, a) => sum + a.time, 0) /
                  currentScenario.answers.length /
                  1000
                ).toFixed(1)}
                s
              </p>
            </div>
          </div>
        </div>

        <div style={styles.explanation}>
          <h3 style={styles.explanationTitle}>How This Scoring Works</h3>
          <p>
            <strong>Timing Score:</strong> Based on how quickly answers are
            submitted (humans naturally take time on difficult questions)
          </p>
          <p>
            <strong>Tab Score:</strong> Each tab switch suggests looking for
            external information
          </p>
          <p>
            <strong>Correct Score:</strong> Perfect accuracy + fast timing =
            statistically suspicious
          </p>
          <p>
            <strong>Total Score:</strong> Combined assessment (0.0 = innocent,
            1.0 = definitely cheating)
          </p>
        </div>

        <div style={styles.videoSection}>
          <h3 style={styles.explanationTitle}>📹 Tutorial Video</h3>
          <p style={styles.videoDescription}>Watch how our quiz app works:</p>
          <div style={styles.videoContainer}>
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/3s08AlYB7yg"
              title="Quiz App Overview"
              style={styles.videoFrame}
              allowFullScreen
            ></iframe>
          </div>
        </div>
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
    maxWidth: "1000px",
    width: "100%",
    maxHeight: "95vh",
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
    color: "#42a5f5",
  },
  title: {
    fontSize: "32px",
    marginBottom: "10px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "16px",
    color: "#b0b0b0",
    marginBottom: "20px",
  },
  scenarioSelector: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  scenarioBtn: {
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s",
  },
  scenarioBox: {
    border: "3px solid",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    backgroundColor: "#2d2d2d",
  },
  scenarioTitle: {
    marginTop: 0,
    marginBottom: "5px",
    color: "#ffffff",
  },
  scenarioDesc: {
    margin: "0 0 15px 0",
    color: "#b0b0b0",
    fontStyle: "italic",
  },
  verdictBox: {
    padding: "15px",
    borderRadius: "5px",
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  verdictText: {
    margin: 0,
    fontSize: "16px",
  },
  tableWrapper: {
    marginBottom: "30px",
  },
  tableTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#ffffff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    backgroundColor: "#42a5f5",
    color: "#1a1a1a",
    padding: "10px",
    textAlign: "left",
    fontWeight: "bold",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #444",
    textAlign: "center",
    color: "#e0e0e0",
  },
  score: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "3px",
    color: "white",
    fontWeight: "bold",
  },
  statsBox: {
    backgroundColor: "#2d2d2d",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    borderLeft: "4px solid #42a5f5",
  },
  statsTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#42a5f5",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
  },
  stat: {
    textAlign: "center",
    padding: "15px",
    backgroundColor: "#1a1a1a",
    borderRadius: "5px",
    border: "1px solid #444",
  },
  statLabel: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    color: "#999",
    textTransform: "uppercase",
  },
  statValue: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
    color: "#42a5f5",
  },
  explanation: {
    backgroundColor: "#2d2d2d",
    padding: "20px",
    borderRadius: "8px",
    borderLeft: "4px solid #42a5f5",
    color: "#e0e0e0",
  },
  explanationTitle: {
    marginTop: 0,
    marginBottom: "15px",
    color: "#42a5f5",
  },
  videoSection: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#2d2d2d",
    borderRadius: "8px",
    borderLeft: "4px solid #42a5f5",
  },
  videoDescription: {
    color: "#e0e0e0",
    marginBottom: "15px",
  },
  videoContainer: {
    position: "relative" as const,
    paddingBottom: "56.25%",
    height: "0",
    overflow: "hidden" as const,
    borderRadius: "6px",
  },
  videoFrame: {
    position: "absolute" as const,
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "6px",
  },
};
