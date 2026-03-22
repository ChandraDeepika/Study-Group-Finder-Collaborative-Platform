import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

const GROUP_BANNERS = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=70",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=70",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=70",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&q=70",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=70",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=70",
];

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
          <div className="groups-page-hero">
            <div className="groups-hero-content">
              <div><h1>Study Groups</h1><p>Browse, search, and join study groups</p></div>
            </div>
          </div>
          <div className="empty-state">Loading groups...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="groups-wrapper">

        {/* Hero */}
        <div className="groups-page-hero">
          <div className="groups-hero-content">
            <div>
              <h1>Study Groups</h1>
              <p>Browse, search, and join study groups</p>
            </div>
            <div className="groups-hero-stats">
              <div className="groups-hero-stat">
                <span className="groups-hero-stat-num">{groups.length}</span>
                <span className="groups-hero-stat-label">Total Groups</span>
              </div>
              <div className="groups-hero-stat">
                <span className="groups-hero-stat-num">{joinedGroupIds.length}</span>
                <span className="groups-hero-stat-label">Joined</span>
              </div>
            </div>
          </div>
          <div className="groups-hero-img-panel">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
              alt="Study group"
            />
            <div className="groups-hero-img-overlay" />
          </div>
        </div>

        {/* Search + Create */}
        <div className="groups-toolbar">
          <input
            type="text"
            className="groups-search"
            placeholder="Search groups by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="create-group-btn" onClick={() => navigate("/create-group")}>
            + Create Group
          </button>
        </div>

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>No groups found{search ? ` for "${search}"` : ""}.</p>
          </div>
        ) : (
          <div className="groups-grid">
            {filteredGroups.map((group, idx) => {
              const isMember = joinedGroupIds.includes(group.id);
              const isPending = pendingGroupIds.includes(group.id);
              const isAdmin = group.adminEmail === currentUserEmail;
              const bannerImg = GROUP_BANNERS[idx % GROUP_BANNERS.length];

              return (
                <div className="group-card" key={group.id}>
                  <div className="group-card-banner">
                    <img src={bannerImg} alt={group.name} />
                    <div className="group-card-banner-overlay" />
                    <div className="group-card-banner-tag">
                      <span className={`group-privacy-tag${group.privacy === "PRIVATE" ? " private" : ""}`}>
                        {group.privacy === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                      </span>
                    </div>
                  </div>

                  <div className="group-card-top">
                    <h3 onClick={() => navigate(`/groups/${group.id}`)} style={{ cursor: "pointer" }}>
                      {group.name}
                    </h3>
                    <p className="group-description">{group.description}</p>
                  </div>

                  <div className="group-card-bottom">
                    <div className="group-meta">
                      {group.courseName && (
                        <span style={{
                          fontSize: "12px", color: "#2563eb", fontWeight: 600,
                          background: "#eff6ff", padding: "3px 10px",
                          borderRadius: "20px", border: "1px solid #dbeafe",
                        }}>
                          📚 {group.courseName}
                        </span>
                      )}
                      <span>👥 {group.memberCount} {group.memberCount === 1 ? "member" : "members"}</span>
                    </div>

                    {isAdmin ? (
                      <button className="primary-btn" onClick={() => navigate(`/groups/${group.id}`)}>
                        ⭐ Manage Group
                      </button>
                    ) : isMember ? (
                      <button className="joined-badge" onClick={() => navigate(`/groups/${group.id}`)}>
                        ✓ View Group
                      </button>
                    ) : isPending ? (
                      <span className="pending-badge">⏳ Request Sent</span>
                    ) : (
                      <button className="primary-btn" onClick={() => handleJoin(group.id)}>
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
