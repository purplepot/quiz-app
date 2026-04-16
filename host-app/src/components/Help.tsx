import React from "react";

interface HelpProps {
  onClose: () => void;
}

export function Help({ onClose }: HelpProps) {
  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <h1 style={styles.title}>Help & FAQ</h1>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>Q: What is tabSwitchCount?</h3>
          <p style={styles.answer}>
            It counts how many times a student switches away from the quiz
            browser tab (Alt+Tab, clicking another window, etc.). High counts
            suggest looking up answers.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            Q: What suspicion score means immediate flag?
          </h3>
          <p style={styles.answer}>
            Any answer with a score &gt; 0.7 (70% suspicion) is flagged in
            real-time. At quiz end, aggregate analysis also flags players with
            overall suspicious patterns.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            Q: Why does a perfect score with fast timing flag?
          </h3>
          <p style={styles.answer}>
            Humans naturally hesitate on difficult questions. Answering 10/10
            correctly in 2 seconds each is statistically impossible without
            external help.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            Q: Can legitimate fast students be flagged?
          </h3>
          <p style={styles.answer}>
            Yes, which is why we use aggregate analysis. One fast answer = okay.
            Consistently fast + perfect accuracy + high tab switches = definite
            flag.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            Q: Is this using AI or machine learning?
          </h3>
          <p style={styles.answer}>
            No. We use rule-based behavioral analysis. No AI models, no training
            data, no black-box decisions. All logic is transparent and
            explainable.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>Q: How do I review flagged players?</h3>
          <p style={styles.answer}>
            Go to Admin Panel → View flagged players. You can see their
            suspicion score, flags, and detailed answer telemetry for each
            question.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.question}>
            Q: Can students appeal a cheating flag?
          </h3>
          <p style={styles.answer}>
            Yes. Show them their detailed telemetry data. If they have a
            legitimate explanation (knowledge expert, accessibility tools, etc),
            you can manually adjust their flag.
          </p>
        </div>

        <h2 style={styles.subtitle}>Understanding Flags</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Flag Type</th>
              <th style={styles.th}>Meaning</th>
              <th style={styles.th}>Severity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>answer_too_fast</td>
              <td style={styles.td}>Single answer in &lt; 600ms</td>
              <td style={styles.td}>Low</td>
            </tr>
            <tr>
              <td style={styles.td}>high_tab_switch_count</td>
              <td style={styles.td}>&gt; 2 tab switches per question</td>
              <td style={styles.td}>Medium</td>
            </tr>
            <tr>
              <td style={styles.td}>unfocused_submit</td>
              <td style={styles.td}>Answer submitted while unfocused</td>
              <td style={styles.td}>Low</td>
            </tr>
            <tr>
              <td style={styles.td}>aggregate_suspicious</td>
              <td style={styles.td}>Overall suspicious pattern</td>
              <td style={styles.td}>High</td>
            </tr>
            <tr>
              <td style={styles.td}>collusion_high</td>
              <td style={styles.td}>Identical answers with 2+ players</td>
              <td style={styles.td}>Critical</td>
            </tr>
          </tbody>
        </table>
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
    maxWidth: "800px",
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
    color: "#26c6da",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "20px",
    marginTop: "30px",
    marginBottom: "20px",
    color: "#26c6da",
    borderBottom: "2px solid #26c6da",
    paddingBottom: "10px",
  },
  faqItem: {
    marginBottom: "25px",
    padding: "15px",
    backgroundColor: "#2d2d2d",
    borderRadius: "8px",
    borderLeft: "4px solid #26c6da",
  },
  question: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#26c6da",
    fontSize: "16px",
  },
  answer: {
    marginBottom: 0,
    color: "#e0e0e0",
    lineHeight: "1.6",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },
  th: {
    backgroundColor: "#26c6da",
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
