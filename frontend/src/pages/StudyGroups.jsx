import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Courses.css";

const StudyGroups = ({ groups, setGroups }) => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState("");

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleJoin = (id) => {
    const updatedGroups = groups.map(group =>
      group.id === id && !group.joined
        ? { ...group, students: group.students + 1, joined: true }
        : group
    );

    setGroups(updatedGroups);
  };

  const handleCreateGroup = () => {
    if (newGroup.trim() === "") return;

    const newEntry = {
      id: groups.length + 1,
      name: newGroup,
      description: "New study group created by user.",
      students: 1,
      joined: true
    };

    setGroups([...groups, newEntry]);
    setNewGroup("");
    setShowModal(false);
  };

  return (
    <div className="courses-page">
      <h1 className="courses-title">Study Groups</h1>

      <div style={{ marginBottom: "30px", display: "flex", gap: "20px" }}>
        <button
          className="create-button"
          onClick={() => setShowModal(true)}
        >
          + Create Study Group
        </button>

        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="courses-container">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => (
            <div
              key={group.id}
              className="course-card"
              onClick={() => navigate(`/studygroups/${group.id}`)}
              style={{ cursor: "pointer" }}
            >
              <h3>{group.name}</h3>
              <p>{group.students} students joined</p>

              <button
                className="join-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoin(group.id);
                }}
                disabled={group.joined}
                style={{
                  backgroundColor: group.joined ? "#9ca3af" : "#2563eb",
                  cursor: group.joined ? "not-allowed" : "pointer"
                }}
              >
                {group.joined ? "Joined ✓" : "Join Group"}
              </button>
            </div>
          ))
        ) : (
          <p>No groups found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Study Group</h2>

            <input
              type="text"
              placeholder="Enter group name"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              className="modal-input"
            />

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                className="join-button"
                onClick={handleCreateGroup}
              >
                Create
              </button>

              <button
                className="cancel-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
