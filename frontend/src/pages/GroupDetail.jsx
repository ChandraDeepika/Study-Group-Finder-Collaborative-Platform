import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

import { connectWebSocket, sendMessage, disconnectWebSocket } from "../services/websocket";

function GroupDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

useEffect(() => {

  // fetch group + members
  fetchData();

  // connect websocket
  connectWebSocket(id, (message) => {
    setMessages(prev => [...prev, message]);
  });

  return () => {
    disconnectWebSocket();
  };

}, [id]);

  const fetchData = async () => {
    try {

      const groupRes = await api.get(`/groups/${id}`);
      const membersRes = await api.get(`/groups/${id}/members`);

      setGroup(groupRes.data);
      setMembers(membersRes.data);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const email = user.email || "";

      setCurrentUserEmail(email);

      setIsAdmin(
        !!membersRes.data.find(
          m => m.email === email && m.role === "ADMIN"
        )
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

 const handleSend = () => {

  if (!text.trim()) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user.id) {
    console.error("User not found in localStorage");
    return;
  }

  const msg = {
    senderId: user.id,
    messageText: text
  };

  console.log("Sending message:", msg);

  sendMessage(id, msg);

  setText("");
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

  if (loading)
    return (
      <Layout>
        <div className="groups-wrapper">
          <p>Loading...</p>
        </div>
      </Layout>
    );

  if (!group)
    return (
      <Layout>
        <div className="groups-wrapper">
          <p>Group not found.</p>
        </div>
      </Layout>
    );

  const approvedMembers = members.filter(m => m.status === "APPROVED");
  const pendingRequests = members.filter(m => m.status === "PENDING");

  const isMember = approvedMembers.some(
    m => m.email === currentUserEmail
  );

  const adminName =
    approvedMembers.find(m => m.role === "ADMIN")?.userName ||
    group.adminEmail;

  return (
    <Layout>
      <div className="groups-wrapper">

        {/* GROUP HEADER */}

        <div className="page-header">

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1>{group.name}</h1>
            <span className="group-privacy-tag">{group.privacy}</span>
          </div>

          <p>{group.description}</p>

          <span className="group-admin">
            👤 Admin: {adminName}
          </span>

        </div>


        {/* MEMBERS */}

        <div className="group-card">

          <h3>👥 Members ({approvedMembers.length})</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>

            {approvedMembers.map((member) => (

              <div key={member.userId} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#f8fafc",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
              }}>

                <div>
                  <strong>{member.userName}</strong>
                  <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                    {member.email}
                  </p>
                </div>

                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: member.role === "ADMIN" ? "#eff6ff" : "#f0fdf4",
                  color: member.role === "ADMIN" ? "#2563eb" : "#16a34a",
                }}>
                  {member.role}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* 💬 CHAT SECTION */}

        {isMember && (

          <div className="group-card">

            <h3>💬 Group Chat</h3>

            <div style={{
              height: "250px",
              overflowY: "auto",
              background: "#f8fafc",
              padding: "10px",
              borderRadius: "8px",
              marginTop: "10px"
            }}>

             {messages.map((m, i) => (

  <div key={i} style={{ marginBottom: "8px" }}>
    <b>{m.senderName}</b>: {m.messageText}
  </div>

))}

            </div>

            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px"
            }}>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message..."
                style={{
                  flex: 1,
                  padding: "8px"
                }}
              />

              <button
                onClick={handleSend}
                className="primary-btn"
              >
                Send
              </button>

            </div>

          </div>

        )}

      </div>
    </Layout>
  );
}

export default GroupDetail;