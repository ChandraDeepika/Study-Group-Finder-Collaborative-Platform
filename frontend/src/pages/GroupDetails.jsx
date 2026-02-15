import { useParams, useNavigate } from "react-router-dom";

const GroupDetails = ({ groups, setGroups }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const group = groups.find(g => g.id === parseInt(id));

  if (!group) {
    return <h2 style={{ padding: "40px" }}>Group not found</h2>;
  }

  const handleJoin = () => {
    if (group.joined) return;

    const updatedGroups = groups.map(g =>
      g.id === group.id
        ? { ...g, students: g.students + 1, joined: true }
        : g
    );

    setGroups(updatedGroups);
  };

  return (
    <div style={{ padding: "40px" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "8px 15px",
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          maxWidth: "500px"
        }}
      >
        <h1>{group.name}</h1>

        <p style={{ marginTop: "15px", color: "#555" }}>
          {group.description}
        </p>

        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          {group.students} students joined
        </p>

        <button
          onClick={handleJoin}
          disabled={group.joined}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: group.joined ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: group.joined ? "not-allowed" : "pointer"
          }}
        >
          {group.joined ? "Joined ✓" : "Join Group"}
        </button>
      </div>
    </div>
  );
};

export default GroupDetails;
