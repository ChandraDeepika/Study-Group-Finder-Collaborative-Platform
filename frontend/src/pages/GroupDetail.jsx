import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

function GroupDetail() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupRes = await api.get(`/groups/${id}`);
      const membersRes = await api.get(`/groups/${id}/members`);

      setGroup(groupRes.data);
      setMembers(membersRes.data);

      // Get current user email from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user.email || "";
      setCurrentUserEmail(email);

      // Check if current user is admin of this group
      const adminCheck = membersRes.data.find(
        (m) => m.email === email && m.role === "ADMIN"
      );
      setIsAdmin(!!adminCheck);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.post(`/groups/${id}/join-requests`, {
        userId: userId,
        approve: true,
      });
      alert("Member approved!");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to approve");
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/groups/${id}/join-requests`, {
        userId: userId,
        approve: false,
      });
      alert("Request rejected");
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to reject");
    }
  };

  if (!group) {
    return (
      <Layout>
        <div className="groups-wrapper">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  // Separate approved members and pending requests
  const approvedMembers = members.filter((m) => m.status === "APPROVED");
  const pendingRequests = members.filter((m) => m.status === "PENDING");

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
          <span className="group-admin">👤 Admin: {group.adminEmail}</span>
        </div>

        {/* Pending Requests (only visible to admin) */}
        {isAdmin && pendingRequests.length > 0 && (
          <div className="group-card" style={{ borderLeft: "4px solid #d97706" }}>
            <h3>⏳ Pending Join Requests ({pendingRequests.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
              {pendingRequests.map((member) => (
                <div
                  key={member.userId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: "#fffbeb",
                    borderRadius: "10px",
                    border: "1px solid #fde68a",
                  }}
                >
                  <div>
                    <strong>{member.userName}</strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                      {member.email}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="primary-btn"
                      style={{ background: "#16a34a", padding: "6px 16px", fontSize: "12px" }}
                      onClick={() => handleApprove(member.userId)}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="primary-btn"
                      style={{ background: "#ef4444", padding: "6px 16px", fontSize: "12px" }}
                      onClick={() => handleReject(member.userId)}
                    >
                      ❌ Reject
                    </button>
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
              <div
                key={member.userId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div>
                  <strong>{member.userName}</strong>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    {member.email}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: "20px",
                    background: member.role === "ADMIN" ? "#eff6ff" : "#f0fdf4",
                    color: member.role === "ADMIN" ? "#2563eb" : "#16a34a",
                  }}
                >
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default GroupDetail;