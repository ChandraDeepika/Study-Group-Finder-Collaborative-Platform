import { useState } from "react";

function AvailableGroups() {
  const groupsData = [
    { id: 1, name: "DSA Evening Batch", course: "Data Structures" },
    { id: 2, name: "Signals Crash Group", course: "Signals & Systems" },
    { id: 3, name: "OS Interview Prep", course: "Operating Systems" }
  ];

  const [joinedGroups, setJoinedGroups] = useState([]);

  const joinGroup = (id) => {
    if (!joinedGroups.includes(id)) {
      setJoinedGroups([...joinedGroups, id]);
    }
  };

  const leaveGroup = (id) => {
    setJoinedGroups(joinedGroups.filter(g => g !== id));
  };

  // 🔥 Filter available groups
  const availableGroups = groupsData.filter(
    (group) => !joinedGroups.includes(group.id)
  );

  const myGroups = groupsData.filter(
    (group) => joinedGroups.includes(group.id)
  );

  return (
    <div className="peer-card">
      <h2>👥 Study Groups</h2>

      {/* Joined Groups */}
      <h3 style={{ marginBottom: "10px" }}>My Groups</h3>

      {myGroups.length === 0 && <p>No groups joined yet.</p>}

      <ul>
        {myGroups.map((group) => (
          <li key={group.id}>
            <div>
              <strong>{group.name}</strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                {group.course}
              </p>
            </div>

            <button
              style={{ background: "#ef4444" }}
              onClick={() => leaveGroup(group.id)}
            >
              Leave
            </button>
          </li>
        ))}
      </ul>

      {/* Available Groups */}
      <h3 style={{ marginTop: "30px", marginBottom: "10px" }}>
        Available Groups
      </h3>

      {availableGroups.length === 0 && (
        <p>All groups joined ✅</p>
      )}

      <ul>
        {availableGroups.map((group) => (
          <li key={group.id}>
            <div>
              <strong>{group.name}</strong>
              <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                {group.course}
              </p>
            </div>

            <button onClick={() => joinGroup(group.id)}>
              Join
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AvailableGroups;