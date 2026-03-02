import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

export default function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState([]);
  const [pendingGroupIds, setPendingGroupIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGroups();
    fetchJoinedGroupIds();
    fetchPendingGroupIds();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups/filter", {
        params: {
          sortBy: "id",
          sortDir: "desc",
          page: 0,
          size: 50,
        },
      });
      setGroups(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinedGroupIds = async () => {
    try {
      const res = await api.get("/groups/my-group-ids");
      setJoinedGroupIds(res.data);
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
          <button
            className="create-group-btn"
            onClick={() => navigate("/create-group")}
          >
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

              return (
                <div className="group-card" key={group.id}>
                  <div className="group-card-top">
                    <span className="group-privacy-tag">
                      {group.privacy || "PUBLIC"}
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
                      <span className="group-admin">
                        👤 {group.adminEmail}
                      </span>
                    </div>

                    {isMember ? (
                      <span className="joined-badge">✅ Joined</span>
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