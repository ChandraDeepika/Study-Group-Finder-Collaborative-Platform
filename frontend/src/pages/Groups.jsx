import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [pendingGroupIds, setPendingGroupIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const currentUserEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
    fetchJoinedGroupIds();
    fetchPendingGroupIds();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups/search", {
        params: { sortBy: "id", sortDir: "desc", page: 0, size: 50 },
      });
      setGroups(res.data.content);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedGroupIds = async () => {
    try {
      const res = await api.get("/groups/my-groups");
      setJoinedGroupIds(res.data.map((g) => g.id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPendingGroupIds = async () => {
    try {
      const res = await api.get("/groups/my-pending-ids");
      setPendingGroupIds(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoin = async (id) => {
    try {
      const res = await api.post(`/groups/${id}/join`);
      alert(res.data || "Join request sent!");
      fetchGroups();
      fetchJoinedGroupIds();
      fetchPendingGroupIds();
    } catch (error) {
      console.error(error);
      alert("Failed to join group");
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name?.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="groups-wrapper">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="groups-wrapper">

        {/* Header */}
        <div className="page-header">
          <h1>Study Groups</h1>
          <p>Browse, search, and join study groups</p>
        </div>

        {/* Search + Create */}
        <div className="groups-toolbar">
          <input
            type="text"
            className="groups-search"
            placeholder="🔍 Search groups by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="create-group-btn" onClick={() => navigate("/create-group")}>
            + Create Group
          </button>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="empty-state">No groups found.</div>
        ) : (
          <div className="groups-grid">
            {filteredGroups.map((group) => {
              const isMember = joinedGroupIds.includes(group.id);
              const isPending = pendingGroupIds.includes(group.id);
              const isAdmin = group.adminEmail === currentUserEmail;

              return (
                <div className="group-card" key={group.id}>
                  <div className="group-card-top">
                    <span className={`group-privacy-tag${group.privacy === "PRIVATE" ? " private" : ""}`}>
                      {group.privacy === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                    </span>
                    <h3
                      onClick={() => navigate(`/groups/${group.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {group.name}
                    </h3>
                    <p className="group-description">{group.description}</p>
                  </div>

                  <div className="group-card-bottom">
                    <div className="group-meta">
                      {group.courseName && (
                        <span style={{
                          fontSize: "12px",
                          color: "#2563eb",
                          fontWeight: 600,
                          background: "#eff6ff",
                          padding: "3px 10px",
                          borderRadius: "20px",
                          border: "1px solid #dbeafe",
                        }}>
                          {group.courseName}
                        </span>
                      )}
                      <span style={{
                        fontSize: "12px", color: "#6b7280",
                        display: "flex", alignItems: "center", gap: "4px"
                      }}>
                        👥 {group.memberCount} {group.memberCount === 1 ? "member" : "members"}
                      </span>
                    </div>

                    {isAdmin ? (
                      <button
                        className="primary-btn"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        ⭐ Manage Group
                      </button>
                    ) : isMember ? (
                      <button
                        className="joined-badge"
                        style={{ cursor: "pointer", border: "none", width: "100%" }}
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                         View Group
                      </button>
                    ) : isPending ? (
                      <span className="pending-badge">⏳ Request Sent to Admin</span>
                    ) : (
                      <button
                        className="primary-btn"
                        onClick={() => handleJoin(group.id)}
                      >
                        Join Group
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Groups;