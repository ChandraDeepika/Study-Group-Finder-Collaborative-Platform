import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const groupRes = await api.get(`/groups/${id}`);
      const membersRes = await api.get(`/groups/${id}/members`);
      setGroup(groupRes.data);
      setMembers(membersRes.data);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user.email || "";
      setCurrentUserEmail(email);
      setIsAdmin(!!membersRes.data.find(m => m.email === email && m.role === "ADMIN"));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/groups/${id}/join-requests`, { userId, approve: true });
      alert("Member approved!");
      fetchData();
    } catch (error) {
      alert("Failed to approve");
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/groups/${id}/join-requests`, { userId, approve: false });
      alert("Request rejected");
      fetchData();
    } catch (error) {
      alert("Failed to reject");
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await api.post(`/groups/${id}/leave`);
      alert("You left the group");
      navigate("/groups");
    } catch (error) {
      alert(error.response?.data || "Failed to leave group");
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from the group?`)) return;
    try {
      await api.delete(`/groups/${id}/members/${userId}`);
      alert(`${userName} removed`);
      fetchData();
    } catch (error) {
      alert(error.response?.data || "Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("⚠️ Delete this group? This cannot be undone and will remove all members.")) return;
    try {
      await api.delete(`/groups/${id}`);
      alert("Group deleted");
      navigate("/groups");
    } catch (error) {
      alert(error.response?.data || "Failed to delete group");
    }
  };

  if (loading) return <Layout><div className="groups-wrapper"><p>Loading...</p></div></Layout>;
  if (!group)  return <Layout><div className="groups-wrapper"><p>Group not found.</p></div></Layout>;

  const approvedMembers = members.filter(m => m.status === "APPROVED");
  const pendingRequests = members.filter(m => m.status === "PENDING");
  const isMember = approvedMembers.some(m => m.email === currentUserEmail);
  const adminName = approvedMembers.find(m => m.role === "ADMIN")?.userName || group.adminEmail;

  return (
    <Layout>
      <div className="groups-wrapper">

        {/* Group Header */}
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1>{group.name}</h1>
            <span className="group-privacy-tag">{group.privacy}</span>
          </div>
          <p>{group.description}</p>
          <span className="group-admin">👤 Admin: {adminName}</span>
        </div>

        {/* Pending Requests (admin only) */}
        {isAdmin && pendingRequests.length > 0 && (
          <div className="group-card" style={{ borderLeft: "4px solid #d97706" }}>
            <h3>⏳ Pending Join Requests ({pendingRequests.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              {pendingRequests.map((member) => (
                <div key={member.userId} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", background: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a",
                }}>
                  <div>
                    <strong>{member.userName}</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{member.email}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="primary-btn"
                      style={{ background: "#16a34a", padding: "6px 16px", fontSize: "12px" }}
                      onClick={() => handleApprove(member.userId)}>✅ Approve</button>
                    <button className="primary-btn"
                      style={{ background: "#ef4444", padding: "6px 16px", fontSize: "12px" }}
                      onClick={() => handleReject(member.userId)}>❌ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Members */}
        <div className="group-card">
          <h3>👥 Members ({approvedMembers.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
            {approvedMembers.map((member) => (
              <div key={member.userId} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0",
              }}>
                <div>
                  <strong>{member.userName}</strong>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>{member.email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px",
                    background: member.role === "ADMIN" ? "#eff6ff" : "#f0fdf4",
                    color: member.role === "ADMIN" ? "#2563eb" : "#16a34a",
                  }}>
                    {member.role}
                  </span>
                  {isAdmin && member.role !== "ADMIN" && (
                    <button
                      onClick={() => handleRemove(member.userId, member.userName)}
                      style={{
                        padding: "4px 12px", fontSize: "11px", fontWeight: 600,
                        background: "transparent", color: "#dc2626",
                        border: "1px solid #fca5a5", borderRadius: "8px", cursor: "pointer",
                      }}
                      onMouseOver={e => e.target.style.background = "#fee2e2"}
                      onMouseOut={e => e.target.style.background = "transparent"}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave button — non-admin members only */}
        {isMember && !isAdmin && (
          <div>
            <button onClick={handleLeave} style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "9px 22px", background: "transparent", color: "#ef4444",
              border: "1.5px solid #ef4444", borderRadius: "10px",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
            }}
              onMouseOver={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
            >
              🚪 Leave Group
            </button>
          </div>
        )}

        {/* Delete Group — admin only */}
        {isAdmin && (
          <div>
            <button
              onClick={handleDeleteGroup}
              style={{
                display: "inline-flex", alignItems: "center", gap: "7px",
                padding: "9px 22px", background: "transparent", color: "#dc2626",
                border: "1.5px solid #ef4444", borderRadius: "10px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#ef4444"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#dc2626"; }}
            >
              Delete Group
            </button>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default GroupDetail;