import React from "react";

interface ReferencesProps {
  onClose: () => void;
}

export function References({ onClose }: ReferencesProps) {
  return (
    <div style={styles.modal}>
      <div style={styles.container}>
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <h1 style={styles.title}>References & Further Reading</h1>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>📚 Textbook References</h2>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              "Computer Networks: A Top-Down Approach"
            </h3>
            <p style={styles.refAuthor}>Kurose, James F., & Ross, Keith W.</p>
            <p style={styles.refDetails}>
              7th Edition, 2016. Pearson.
              <br />
              <strong>Relevant Chapter:</strong> Chapter 1.1 - "What is the
              Internet?"
            </p>
            <a
              href="https://www.pearsonhighered.com/product/Kurose-Computer-Networks-A-Top-Down-Approach-7-e/9780134180793.html"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Pearson →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>"Introduction to Cybersecurity"</h3>
            <p style={styles.refAuthor}>DeCusatis, Carolyn, & Carrillo, Jose</p>
            <p style={styles.refDetails}>
              1st Edition, 2019. Pearson.
              <br />
              <strong>Relevant Chapter:</strong> Chapter 5 - "Authentication and
              Security"
            </p>
            <a
              href="https://www.pearsonhighered.com/product/DeCusatis-Introduction-to-Cybersecurity/9780134823652.html"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Pearson →
            </a>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>🔗 Official Technical Resources</h2>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              OWASP - Open Web Application Security Project
            </h3>
            <p style={styles.refDetails}>
              Security guidelines and best practices for web applications
            </p>
            <a
              href="https://owasp.org/"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit OWASP →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>Mozilla Developer Network (MDN)</h3>
            <p style={styles.refDetails}>
              Web APIs: Visibility API for detecting tab switches
            </p>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visibility API Documentation →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>WebRTC & Real-time Communication</h3>
            <p style={styles.refDetails}>
              Standards for real-time data transmission
            </p>
            <a
              href="https://www.w3.org/TR/webrtc/"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              W3C WebRTC Specification →
            </a>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>
            📖 Research Papers & Educational Sites
          </h2>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              "Detecting Cheating in Online Exams"
            </h3>
            <p style={styles.refDetails}>
              IEEE Xplore - A comprehensive survey of cheating detection
              techniques
            </p>
            <a
              href="https://ieeexplore.ieee.org/"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              IEEE Xplore →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              Coursera - Machine Learning Specialization
            </h3>
            <p style={styles.refDetails}>
              Online course covering classification and anomaly detection
            </p>
            <a
              href="https://www.coursera.org/specializations/machine-learning-introduction"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Course →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>Kaggle - Fraud & Anomaly Detection</h3>
            <p style={styles.refDetails}>
              Real-world datasets and competitions for detection systems
            </p>
            <a
              href="https://www.kaggle.com/search?q=fraud+detection"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Kaggle Datasets →
            </a>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              Google Cloud - Real-time Anomaly Detection
            </h3>
            <p style={styles.refDetails}>
              Technical documentation on detecting unusual patterns
            </p>
            <a
              href="https://cloud.google.com/architecture/detecting-anomalies-in-time-series-data"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Article →
            </a>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>🎓 Educational Videos</h2>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>Anomaly Detection Fundamentals</h3>
            <p style={styles.refDetails}>
              Learn how to detect unusual patterns in data (YouTube)
            </p>
            <div style={styles.videoContainer}>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/qy41dXGbAxY"
                title="Anomaly Detection"
                style={styles.videoFrame}
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>
              Real-time Data Processing with WebSockets
            </h3>
            <p style={styles.refDetails}>
              Understanding real-time communication protocols
            </p>
            <div style={styles.videoContainer}>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/1BfCnjr_Vjg"
                title="WebSockets"
                style={styles.videoFrame}
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>Pattern Recognition in Python</h3>
            <p style={styles.refDetails}>
              Building detection systems with behavioral analysis
            </p>
            <div style={styles.videoContainer}>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/YIUk2rvDxp0"
                title="Pattern Recognition"
                style={styles.videoFrame}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subtitle}>📊 Virtual Lab Reference</h2>

          <div style={styles.reference}>
            <h3 style={styles.refTitle}>This Project - GitHub Repository</h3>
            <p style={styles.refDetails}>
              Complete source code with comments and implementation details
            </p>
            <a
              href="https://github.com"
              style={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Source Code →
            </a>
          </div>
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
    color: "#4caf50",
  },
  title: {
    fontSize: "32px",
    marginBottom: "30px",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "20px",
    marginTop: "25px",
    marginBottom: "20px",
    color: "#4caf50",
    borderBottom: "2px solid #4caf50",
    paddingBottom: "10px",
  },
  section: {
    marginBottom: "30px",
  },
  reference: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#2d2d2d",
    borderRadius: "8px",
    borderLeft: "4px solid #4caf50",
  },
  refTitle: {
    marginTop: 0,
    marginBottom: "8px",
    color: "#ffffff",
    fontSize: "16px",
  },
  refAuthor: {
    margin: "5px 0",
    color: "#b0b0b0",
    fontStyle: "italic",
    fontSize: "14px",
  },
  refDetails: {
    margin: "8px 0",
    color: "#e0e0e0",
    lineHeight: "1.5",
    fontSize: "14px",
  },
  link: {
    display: "inline-block",
    color: "#4caf50",
    textDecoration: "none",
    marginTop: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  videoContainer: {
    marginTop: "12px",
    borderRadius: "6px",
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  videoFrame: {
    border: "none",
    borderRadius: "6px",
  },
};
