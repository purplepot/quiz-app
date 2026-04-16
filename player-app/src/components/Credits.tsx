import React from "react";
import priyanshImg from "../../../images/priyansh.jpeg";
import mentorImg from "../../../images/mentor.jpg";

interface CreditsProps {
  onClose: () => void;
}

export function Credits({ onClose }: CreditsProps) {
  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <h1 style={styles.title}>About This Project</h1>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Project Overview</h2>
          <p style={styles.text}>
            A behavioral analysis system for detecting academic dishonesty in
            online quizzes. This project demonstrates rule-based anomaly
            detection, real-time telemetry analysis, and comparative pattern
            matching without machine learning.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Development Team</h2>
          <div style={styles.team}>
            <div style={styles.member}>
              <img
                src={priyanshImg}
                alt="Priyansh"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
              <p style={styles.role}>Lead Developer</p>
              <p style={styles.name}>Priyansh</p>
              <p
                style={{
                  ...styles.text,
                  margin: "5px 0 0 0",
                  fontSize: "12px",
                }}
              >
                Reg: 24BYB1107
              </p>
            </div>
            <div style={styles.member}>
              <img
                src={mentorImg}
                alt="Dr Swaminathan"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
              <p style={styles.role}>Mentor</p>
              <p style={styles.name}>Dr Swaminathan</p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Technology Stack</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Component</th>
                <th style={styles.th}>Technology</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td}>Frontend</td>
                <td style={styles.td}>React + TypeScript</td>
              </tr>
              <tr>
                <td style={styles.td}>Host App</td>
                <td style={styles.td}>Vite + React</td>
              </tr>
              <tr>
                <td style={styles.td}>Player App</td>
                <td style={styles.td}>Vite + React</td>
              </tr>
              <tr>
                <td style={styles.td}>Backend</td>
                <td style={styles.td}>Node.js + Express + TypeScript</td>
              </tr>
              <tr>
                <td style={styles.td}>Database</td>
                <td style={styles.td}>MongoDB</td>
              </tr>
              <tr>
                <td style={styles.td}>Real-time</td>
                <td style={styles.td}>WebSocket</td>
              </tr>
              <tr>
                <td style={styles.td}>Build Tool</td>
                <td style={styles.td}>Vite</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Key Features</h2>
          <ul style={styles.list}>
            <li>
              Real-time telemetry collection (timing, tab switches, focus)
            </li>
            <li>Per-answer suspicion scoring (0-1 scale)</li>
            <li>Aggregate behavioral pattern analysis</li>
            <li>Collusion detection via answer comparison</li>
            <li>
              Transparent, rule-based logic (no machine learning black boxes)
            </li>
            <li>Administrator dashboard for reviewing flagged players</li>
            <li>Quiz history and leaderboard tracking</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Architecture Components</h2>

          <div style={styles.component}>
            <h3 style={styles.compTitle}>Server (/suspicionScoring.ts)</h3>
            <p style={styles.compDesc}>
              Rule-based scoring engine that evaluates each answer against
              behavioral benchmarks
            </p>
          </div>

          <div style={styles.component}>
            <h3 style={styles.compTitle}>Analytics (/playerStats.ts)</h3>
            <p style={styles.compDesc}>
              Aggregates per-answer telemetry into player-level statistics
            </p>
          </div>

          <div style={styles.component}>
            <h3 style={styles.compTitle}>
              Comparative Analysis (/collusionDetection.ts)
            </h3>
            <p style={styles.compDesc}>
              Detects suspicious similarities between player answer patterns
            </p>
          </div>

          <div style={styles.component}>
            <h3 style={styles.compTitle}>Real-time Updates</h3>
            <p style={styles.compDesc}>
              WebSocket integration broadcasts suspicious activities to admin
            </p>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>How to Use This System</h2>
          <ol style={styles.orderedList}>
            <li>
              <strong>Administrator:</strong> Create quizzes and set passing
              criteria
            </li>
            <li>
              <strong>Students:</strong> Join quizzes using unique player codes
            </li>
            <li>
              <strong>Monitoring:</strong> Watch real-time suspicion flags in
              Admin Panel
            </li>
            <li>
              <strong>Review:</strong> After quiz, analyze flagged players' data
            </li>
            <li>
              <strong>Action:</strong> Decide on academic integrity measures
            </li>
          </ol>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Academic Integrity</h2>
          <p style={styles.text}>
            This system is designed to support academic integrity, not replace
            human judgment. All flags should be reviewed by instructors who can
            evaluate context and individual circumstances. Students have the
            right to explain unusual patterns (e.g., accessibility tools, prior
            knowledge).
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Future Enhancements</h2>
          <ul style={styles.list}>
            <li>
              Optional machine learning models (would require historical
              training data)
            </li>
            <li>
              Integration with learning management systems (Canvas, Blackboard)
            </li>
            <li>Advanced visualization dashboards</li>
            <li>Custom rule configuration by institution</li>
            <li>Multi-language support</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>Contact & Support</h2>
          <p style={styles.text}>
            For questions or issues with this system, please contact the
            development team or your institution's IT support.
          </p>
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
    color: "#ce93d8",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "20px",
    marginTop: "25px",
    marginBottom: "15px",
    color: "#ce93d8",
    borderBottom: "2px solid #ce93d8",
    paddingBottom: "10px",
  },
  section: {
    marginBottom: "30px",
  },
  text: {
    lineHeight: "1.6",
    color: "#e0e0e0",
    margin: "10px 0",
  },
  team: {
    display: "flex",
    gap: "30px",
    flexWrap: "wrap",
  },
  member: {
    padding: "15px",
    backgroundColor: "#2d2d2d",
    borderRadius: "8px",
    borderLeft: "4px solid #ce93d8",
    minWidth: "200px",
  },
  role: {
    margin: 0,
    color: "#ce93d8",
    fontWeight: "bold",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  name: {
    margin: "5px 0 0 0",
    fontSize: "16px",
    color: "#ffffff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
  th: {
    backgroundColor: "#ce93d8",
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
  list: {
    marginLeft: "20px",
    lineHeight: "1.8",
    color: "#e0e0e0",
  },
  orderedList: {
    marginLeft: "20px",
    lineHeight: "1.8",
    color: "#e0e0e0",
  },
  component: {
    backgroundColor: "#2d2d2d",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
    borderLeft: "4px solid #ce93d8",
  },
  compTitle: {
    marginTop: 0,
    marginBottom: "8px",
    color: "#ce93d8",
  },
  compDesc: {
    margin: 0,
    color: "#e0e0e0",
    fontSize: "14px",
    lineHeight: "1.5",
  },
};
