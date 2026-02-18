import { useState } from "react";

function AvailableGroups() {
  const groups = [
    { id: 1, name: "DSA Evening Batch", course: "Data Structures" },
    { id: 2, name: "Signals Crash Group", course: "Signals & Systems" },
    { id: 3, name: "OS Interview Prep", course: "Operating Systems" }
  ];

  const [joinedGroups, setJoinedGroups] = useState([]);

  const joinGroup = (group) => {
    if (!joinedGroups.includes(group.id)) {
      setJoinedGroups([...joinedGroups, group.id]);
    }
  };

  return (
    <div className="peer-card">
      <h2>Available Study Groups</h2>

      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <div>
              <strong>{group.name}</strong>
              <p style={{ margin: 0, fontSize: "13px" }}>
                {group.course}
              </p>
            </div>

            {joinedGroups.includes(group.id) ? (
              <button disabled>Joined</button>
            ) : (
              <button onClick={() => joinGroup(group)}>
                Join
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AvailableGroups;
