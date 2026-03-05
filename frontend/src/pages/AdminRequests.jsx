import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/admin.css";

export default function AdminRequests() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [myGroups, setMyGroups] = useState([]);
  const [requests, setRequests] = useState({}); // { [groupId]: [members] }
  const [loading, setLoading] = useState(true);
  const [actionState, setActionState] = useState({}); // { [userId_groupId]: "loading" }
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  // ── Fetch admin groups + their pending members ──────────────
  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Get groups the user is in
        const myRes = await fetch("http://localhost:8080/api/groups/my-admin-groups", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!myRes.ok) return;

        const myGroupsData = await myRes.json();
        setMyGroups(myGroupsData);

        // For each group, get members and filter PENDING ones
        const requestMap = {};
        await Promise.all(
          myGroupsData.map(async (group) => {
            const membersRes = await fetch(
              `http://localhost:8080/api/groups/${group.id}/members`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (membersRes.ok) {
              const members = await membersRes.json();
              const pending = members.filter(m => m.status === "PENDING");
              if (pending.length > 0) {
                requestMap[group.id] = pending;
              }
            }
          })
        );
        setRequests(requestMap);
      } catch (e) {
        console.error("AdminRequests fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token, navigate]);

  // ── Approve or Reject ────────────────────────────────────────
  const handleAction = async (groupId, userId, approve) => {
    const key = `${userId}_${groupId}`;
    setActionState((prev) => ({ ...prev, [key]: "loading" }));

    try {
      const res = await fetch(`http://localhost:8080/api/groups/${groupId}/join-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, approve })
      });

      if (res.ok) {
        // Remove this request from the list
        setRequests((prev) => ({
          ...prev,
          [groupId]: prev[groupId].filter(m => m.userId !== userId)
        }));
        showToast(approve ? "✓ Request approved" : "✕ Request rejected", approve ? "success" : "error");
      }
    } catch (e) {
      console.error("Action error:", e);
    } finally {
      setActionState((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Total pending count ──────────────────────────────────────
  const totalPending = Object.values(requests).reduce((sum, arr) => sum + arr.length, 0);

  // ── Groups that have pending requests ────────────────────────
  const groupsWithRequests = myGroups.filter(g => requests[g.id]?.length > 0);

  // ── Search filter ────────────────────────────────────────────
  const filteredGroups = groupsWithRequests.filter(g => {
    const q = search.toLowerCase();
    if (!q) return true;
    const groupMatch = g.name.toLowerCase().includes(q);
    const memberMatch = requests[g.id]?.some(
      m => m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
    return groupMatch || memberMatch;
  });

  return (
    <Layout>
      <div className="admin-wrapper">

        {/* Toast */}
        {toast && (
          <div className={`admin-toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Join Requests</h1>
            <p>Manage pending requests for groups you admin</p>
          </div>
          {totalPending > 0 && (
            <div className="pending-badge-large">
              {totalPending} pending
            </div>
          )}
        </div>

        {/* Search */}
        <div className="admin-search-wrap">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by group name, member name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search"
          />
          {search && (
            <button className="admin-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="admin-skeletons">
            {[1, 2, 3].map(i => <div key={i} className="admin-skeleton" />)}
          </div>
        )}

        {/* No admin groups */}
        {!loading && myGroups.length === 0 && (
          <div className="admin-empty">
            <div className="admin-empty-icon">🔐</div>
            <h3>No groups to manage</h3>
            <p>You are not an admin of any group yet. Create a group to start managing join requests.</p>
          </div>
        )}

        {/* No pending requests */}
        {!loading && myGroups.length > 0 && totalPending === 0 && (
          <div className="admin-empty">
            <div className="admin-empty-icon">✅</div>
            <h3>All caught up!</h3>
            <p>No pending join requests across your groups.</p>
          </div>
        )}

        {/* No search results */}
        {!loading && totalPending > 0 && filteredGroups.length === 0 && search && (
          <div className="admin-empty">
            <div className="admin-empty-icon">🔍</div>
            <h3>No results for "{search}"</h3>
            <p>Try searching by group name or member details.</p>
          </div>
        )}

        {/* Request cards */}
        {!loading && filteredGroups.map((group) => (
          <div className="admin-group-card" key={group.id}>

            {/* Group header */}
            <div className="admin-group-header">
              <div className="admin-group-info">
                <h3>{group.name}</h3>
                <span className={`privacy-pill ${group.privacy === "PUBLIC" ? "public" : "private"}`}>
                  {group.privacy === "PUBLIC" ? "🌐 Public" : "🔒 Private"}
                </span>
              </div>
              <span className="admin-pending-count">
                {requests[group.id]?.length} pending
              </span>
            </div>

            {/* Request rows */}
            <div className="admin-requests-list">
              {requests[group.id]?.map((member) => {
                const key = `${member.userId}_${group.id}`;
                const isLoading = actionState[key] === "loading";

                return (
                  <div className="admin-request-row" key={member.userId}>
                    {/* Avatar */}
                    <div className="admin-avatar">
                      {member.profileImage ? (
                        <img
                          src={`http://localhost:8080/uploads/${member.profileImage}`}
                          alt={member.userName}
                          className="admin-avatar-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerText =
                              (member.userName || "?").charAt(0).toUpperCase();
                          }}
                        />
                      ) : (
                        (member.userName || "?").charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="admin-member-info">
                      <p className="admin-member-name">
                        {member.userName || "Unknown"}
                      </p>
                      <p className="admin-member-email">{member.email || "No email"}</p>
                      <div className="admin-member-tags">
                        {member.field && (
                          <span className="admin-tag">📚 {member.field}</span>
                        )}
                        {member.educationLevel && (
                          <span className="admin-tag">🎓 {member.educationLevel}</span>
                        )}
                        {member.location && (
                          <span className="admin-tag">📍 {member.location}</span>
                        )}
                        {member.skills && (
                          <span className="admin-tag">🛠 {member.skills}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="admin-actions">
                      <button
                        className="btn-approve"
                        onClick={() => handleAction(group.id, member.userId, true)}
                        disabled={isLoading}
                      >
                        {isLoading ? "..." : "✓ Approve"}
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleAction(group.id, member.userId, false)}
                        disabled={isLoading}
                      >
                        {isLoading ? "..." : "✕ Reject"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </Layout>
  );
}