import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Groups() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const joinGroup = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      alert("Request Sent / Joined Successfully");
    } catch (err) {
      alert("Failed to join group");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Study Groups</h1>
<div style={{ marginBottom: "25px" }}>
        <Link to="/create-group">
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#00b894",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            + Create New Group
          </button>
        </Link>
      </div>
        <div style={styles.grid}>
          {groups.map((group) => (
            <div key={group.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.groupName}>{group.name}</h3>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor:
                      group.privacy === "PRIVATE"
                        ? "#ffe5e5"
                        : "#e6f7ff",
                    color:
                      group.privacy === "PRIVATE"
                        ? "#d63031"
                        : "#0984e3",
                  }}
                >
                  {group.privacy}
                </span>
              </div>

              <p style={styles.description}>{group.description}</p>

              <div style={styles.buttonGroup}>
                <button
                  style={styles.joinBtn}
                  onClick={() => joinGroup(group.id)}
                >
                  Join Group
                </button>

                <Link
                  to={`/groups/${group.id}/members`}
                  style={styles.membersBtn}
                >
                  View Members
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#f4f6f9",
    minHeight: "100vh",
    padding: "40px 20px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
    marginBottom: "30px",
    color: "#2d3436",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "0.3s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  groupName: {
    fontSize: "20px",
    fontWeight: "600",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  description: {
    fontSize: "14px",
    color: "#636e72",
    marginBottom: "15px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  joinBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6c5ce7",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  },
  membersBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    textAlign: "center",
    backgroundColor: "#dfe6e9",
    color: "#2d3436",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Groups;