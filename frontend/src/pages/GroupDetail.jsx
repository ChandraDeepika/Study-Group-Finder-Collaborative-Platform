import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";
import "../styles/GroupDetail.css";

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
      fetchData();
    } catch { alert("Failed to approve"); }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/groups/${id}/join-requests`, { userId, approve: false });
      fetchData();
    } catch { alert("Failed to reject"); }
  };

  const handleLeave = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await api.post(`/groups/${id}/leave`);
      navigate("/groups");
    } catch (error) {
      alert(error.response?.data || "Failed to leave group");
    }
  };

  const handleRemove = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName} from the group?`)) return;
    try {
      await api.delete(`/groups/${id}/members/${userId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data || "Failed to remove member");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("⚠️ Delete this group? This cannot be undone.")) return;
    try {
      await api.delete(`/groups/${id}`);
      navigate("/groups");
    } catch (error) {
      alert(error.response?.data || "Failed to delete group");
    }
  };

  if (loading) return <Layout><div className="groups-wrapper"><div className="empty-state">Loading...</div></div></Layout>;
  if (!group)  return <Layout><div className="groups-wrapper"><div className="empty-state">Group not found.</div></div></Layout>;

  const approvedMembers = members.filter(m => m.status === "APPROVED");
  const pendingRequests = members.filter(m => m.status === "PENDING");
  const isMember = approvedMembers.some(m => m.email === currentUserEmail);
  const adminName = approvedMembers.find(m => m.role === "ADMIN")?.userName || group.adminEmail;

  return (
    <Layout>
      <div className="groups-wrapper">

        {/* Group Hero */}
        <div className="gd-hero">
          <div className="gd-hero-left">
            <div className="gd-hero-avatar">{group.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="gd-hero-title-row">
                <h1>{group.name}</h1>
                <span className={`group-privacy-tag${group.privacy === "PRIVATE" ? " private" : ""}`}>
                  {group.privacy === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                </span>
              </div>
              <p className="gd-hero-desc">{group.description}</p>
              <span className="gd-hero-admin">👤 Admin: {adminName}</span>
            </div>
          </div>
          {isMember && (
            <button className="gd-chat-btn" onClick={() => navigate(`/groups/${id}/chat`)}>
              💬 Open Chat
            </button>
          )}
        </div>

        {/* Pending Requests — admin only */}
        {isAdmin && pendingRequests.length > 0 && (
          <div className="gd-section">
            <div className="gd-section-header pending">
              <h3>⏳ Pending Requests</h3>
              <span className="gd-count-badge amber">{pendingRequests.length}</span>
            </div>
            <div className="gd-members-list">
              {pendingRequests.map((member) => (
                <div key={member.userId} className="gd-member-row pending-row">
                  <div className="gd-member-avatar">{(member.userName || "?")[0].toUpperCase()}</div>
                  <div className="gd-member-info">
                    <strong>{member.userName}</strong>
                    <span>{member.email}</span>
                  </div>
                  <div className="gd-member-actions">
                    <button className="gd-btn-approve" onClick={() => handleApprove(member.userId)}>✓ Approve</button>
                    <button className="gd-btn-reject"  onClick={() => handleReject(member.userId)}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved Members */}
        <div className="gd-section">
          <div className="gd-section-header">
            <h3>👥 Members</h3>
            <span className="gd-count-badge blue">{approvedMembers.length}</span>
          </div>
          <div className="gd-members-list">
            {approvedMembers.map((member) => (
              <div key={member.userId} className="gd-member-row">
                <div className="gd-member-avatar">{(member.userName || "?")[0].toUpperCase()}</div>
                <div className="gd-member-info">
                  <strong>{member.userName}</strong>
                  <span>{member.email}</span>
                </div>
                <div className="gd-member-actions">
                  <span className={`gd-role-badge ${member.role === "ADMIN" ? "admin" : "member"}`}>
                    {member.role === "ADMIN" ? "👑 Admin" : "Member"}
                  </span>
                  {isAdmin && member.role !== "ADMIN" && (
                    <button className="gd-btn-remove" onClick={() => handleRemove(member.userId, member.userName)}>
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        {(isMember || isAdmin) && (
          <div className="gd-danger-zone">
            {isMember && !isAdmin && (
              <button className="gd-btn-leave" onClick={handleLeave}>🚪 Leave Group</button>
            )}
            {isAdmin && (
              <button className="gd-btn-delete" onClick={handleDeleteGroup}>🗑 Delete Group</button>
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}

export default GroupDetail;
