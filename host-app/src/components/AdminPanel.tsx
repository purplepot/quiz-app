import React, { useState, useEffect } from "react";

interface AdminStats {
  totalQuizzes: number;
  totalPlayers: number;
  flaggedPlayers: number;
  averageSuspicion: number;
}

interface FlaggedPlayer {
  playerId: string;
  playerName: string;
  quizTitle: string;
  suspicionScore: number;
  flags: string[];
  tabSwitchCount: number;
  answeredQuestions: number;
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"overview" | "flagged" | "all">(
    "overview",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<AdminStats>({
    totalQuizzes: 0,
    totalPlayers: 0,
    flaggedPlayers: 0,
    averageSuspicion: 0,
  });
  const [flaggedPlayers, setFlaggedPlayers] = useState<FlaggedPlayer[]>([]);

  const API_URL =
    (import.meta as any).env.VITE_API_URL || "http://localhost:3003";

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!statsRes.ok) throw new Error("Failed to fetch stats");
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch flagged players
      const flaggedRes = await fetch(`${API_URL}/api/admin/flagged-players`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!flaggedRes.ok) throw new Error("Failed to fetch flagged players");
      const flaggedData = await flaggedRes.json();
      setFlaggedPlayers(flaggedData);

      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div style={styles.container}>Loading admin data...</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Admin Dashboard</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Overview Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalQuizzes}</div>
          <div style={styles.statLabel}>Total Quizzes</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalPlayers}</div>
          <div style={styles.statLabel}>Total Participants</div>
        </div>
        <div style={{ ...styles.statCard, backgroundColor: "#fee2e2" }}>
          <div style={{ ...styles.statValue, color: "#ef4444" }}>
            {stats.flaggedPlayers}
          </div>
          <div style={styles.statLabel}>Flagged Players</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {stats.averageSuspicion.toFixed(1)}
          </div>
          <div style={styles.statLabel}>Avg Suspicion Score</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "overview" ? "#6366f1" : "#e5e7eb",
            color: activeTab === "overview" ? "white" : "#333",
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("flagged")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "flagged" ? "#ef4444" : "#e5e7eb",
            color: activeTab === "flagged" ? "white" : "#333",
          }}
        >
          Flagged Players ({stats.flaggedPlayers})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === "all" ? "#10b981" : "#e5e7eb",
            color: activeTab === "all" ? "white" : "#333",
          }}
        >
          All Data
        </button>
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <div style={styles.section}>
          <h2>System Overview</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoBox}>
              <h3>Suspicious Activity Detected</h3>
              <p style={styles.largeNumber}>{stats.flaggedPlayers}</p>
              <p style={styles.infoText}>
                Players flagged for cheating signals
              </p>
            </div>
            <div style={styles.infoBox}>
              <h3>Common Cheating Patterns</h3>
              <ul style={styles.list}>
                <li>
                  High tab-switch count:{" "}
                  {
                    flaggedPlayers.filter((p) =>
                      p.flags.includes("high_tab_switch_count"),
                    ).length
                  }
                </li>
                <li>
                  Answers too fast:{" "}
                  {
                    flaggedPlayers.filter((p) =>
                      p.flags.includes("answer_too_fast"),
                    ).length
                  }
                </li>
                <li>
                  Unfocused submit:{" "}
                  {
                    flaggedPlayers.filter((p) =>
                      p.flags.includes("unfocused_submit"),
                    ).length
                  }
                </li>
                <li>
                  Invalid timestamp:{" "}
                  {
                    flaggedPlayers.filter((p) =>
                      p.flags.includes("invalid_answer_timestamp"),
                    ).length
                  }
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "flagged" && (
        <div style={styles.section}>
          <h2>Flagged Players</h2>
          {flaggedPlayers.length === 0 ? (
            <p style={{ textAlign: "center", color: "#666" }}>
              No flagged players
            </p>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Player Name</th>
                    <th>Quiz</th>
                    <th>Suspicion Score</th>
                    <th>Flags</th>
                    <th>Tab Switches</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedPlayers.map((player, idx) => (
                    <tr key={idx} style={styles.tableRow}>
                      <td style={styles.tableCell}>{player.playerName}</td>
                      <td style={styles.tableCell}>{player.quizTitle}</td>
                      <td
                        style={{
                          ...styles.tableCell,
                          color: "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        {player.suspicionScore}
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.flagsContainer}>
                          {player.flags.slice(0, 2).map((flag, i) => (
                            <span key={i} style={styles.flagBadge}>
                              {flag.replace(/_/g, " ")}
                            </span>
                          ))}
                          {player.flags.length > 2 && (
                            <span style={styles.flagBadge}>
                              +{player.flags.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={styles.tableCell}>{player.tabSwitchCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "all" && (
        <div style={styles.section}>
          <h2>All Participants in Database</h2>
          <p style={{ marginBottom: "20px", color: "#666" }}>
            Total: {stats.totalPlayers} participants across {stats.totalQuizzes}{" "}
            quizzes
          </p>
          <p style={{ color: "#666", fontSize: "14px" }}>
            View suspicion scores and cheating signals for all participants
          </p>
        </div>
      )}

      {/* Footer Note */}
      <div style={styles.footer}>
        <p>
          📊 Admin data is stored in MongoDB and updated in real-time as quizzes
          are conducted.
        </p>
        <p style={{ marginTop: "8px", fontSize: "12px", color: "#999" }}>
          Suspicion scores help identify potential cheating. Scores are
          cumulative across answers.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  error: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "4px",
    marginBottom: "20px",
  },
  statsGrid: {
    display: "grid" as const,
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" as const,
    gap: "20px" as const,
    marginBottom: "30px" as const,
  },
  statCard: {
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center" as const,
  },
  statValue: {
    fontSize: "36px" as const,
    fontWeight: "bold" as const,
    color: "#6366f1",
    marginBottom: "8px",
  },
  statLabel: {
    color: "#666",
    fontSize: "14px" as const,
  },
  tabs: {
    display: "flex" as const,
    gap: "10px" as const,
    marginBottom: "20px" as const,
  },
  tabButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer" as const,
    fontWeight: "600" as const,
  },
  section: {
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px" as const,
  },
  infoGrid: {
    display: "grid" as const,
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" as const,
    gap: "20px" as const,
    marginTop: "20px" as const,
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "16px",
  },
  largeNumber: {
    fontSize: "48px" as const,
    fontWeight: "bold" as const,
    color: "#6366f1",
    margin: "10px 0",
  },
  infoText: {
    color: "#666",
    marginTop: "8px",
  },
  list: {
    listStyle: "none" as const,
    padding: 0,
    marginTop: "12px",
  },
  tableWrapper: {
    overflowX: "auto" as const,
    marginTop: "20px",
  },
  table: {
    width: "100%" as const,
    borderCollapse: "collapse" as const,
    fontSize: "14px" as const,
  },
  tableRow: {
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "12px",
    textAlign: "left" as const,
  },
  flagsContainer: {
    display: "flex" as const,
    gap: "6px" as const,
    flexWrap: "wrap" as const,
  },
  flagBadge: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "2px 8px",
    borderRadius: "3px",
    fontSize: "11px" as const,
    fontWeight: "600" as const,
  },
  footer: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "30px" as const,
    color: "#0369a1",
  },
};
