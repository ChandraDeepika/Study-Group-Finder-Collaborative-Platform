import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/groups/${id}/join`);
      alert("Join request sent!");
    } catch (error) {
      console.error(error);
      alert("Failed to join group");
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Study Groups</h2>

      <button
        onClick={() => navigate("/create-group")}
        style={{
          marginBottom: "20px",
          padding: "10px",
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
        }}
      >
        + Create Group
      </button>

      {groups.map((group) => (
        <div
          key={group.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "10px",
            cursor: "pointer",
          }}
        >
          <h3 onClick={() => navigate(`/groups/${group.id}`)}>
            {group.name}
          </h3>
          <p>{group.description}</p>

          <button onClick={() => handleJoin(group.id)}>Join</button>
        </div>
      ))}
    </div>
  );
}