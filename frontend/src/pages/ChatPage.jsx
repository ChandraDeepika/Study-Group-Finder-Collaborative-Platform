import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/ChatPage.css';
import MessageItem from '../components/MessageItem';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from '../services/api';

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [groupName, setGroupName] = useState("Group Chat");
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserEmail = currentUser.email || "";
  const currentUserName = currentUser.name || "";

  useEffect(() => {
    loadHistory();
    connectWebSocket();
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const groupRes = await api.get(`/groups/${groupId}`);
      setGroupName(groupRes.data.name);

      const chatRes = await api.get(`/groups/${groupId}/chat`);
      setMessages(chatRes.data.map(normalizeMessage));
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setLoading(false);
    }
  };

  const normalizeMessage = (msg) => {
    console.log("Normalizing message:", msg);
    return {
      id: msg.id,
      sender: msg.senderName || msg.sender?.name || msg.sender || "Unknown",
      senderEmail: msg.senderEmail || msg.sender?.email || "",
      text: msg.content || msg.messageText || "",
      time: msg.sentAt || msg.timestamp
        ? new Date(msg.sentAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "",
      groupId: msg.groupId || msg.group?.id,
    };
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem("token");
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected!");
        setConnected(true);
        client.subscribe(`/topic/group`, (message) => {
          console.log("Raw received:", message.body);
          const received = JSON.parse(message.body);
          if (String(received.groupId || received.group?.id) === String(groupId)) {
            setMessages(prev => [...prev, normalizeMessage(received)]);
          }
        });
      },
      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },
    });
    client.activate();
    stompClientRef.current = client;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const payload = {
      groupId: Number(groupId),
      senderId: currentUser.id,
      messageText: newMessage.trim(),
      messageType: "TEXT",
    };

    console.log("Sending payload:", payload);

    if (!stompClientRef.current?.connected) {
      console.error("STOMP not connected!");
      return;
    }

    stompClientRef.current.publish({
      destination: `/app/chat.sendMessage`,
      body: JSON.stringify(payload),
    });
    setNewMessage("");
  };

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <button
          onClick={() => navigate(groupId ? `/groups/${groupId}` : '/groups')}
          style={{
            marginBottom: '16px', background: 'transparent', border: 'none',
            color: '#3b82f6', cursor: 'pointer', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem'
          }}
        >
          ⬅ Back to Group
        </button>

        <div className="chat-page-container">
          <div className="chat-header">
            <h2>{groupName}</h2>
            <span style={{
              fontSize: "12px", fontWeight: 600, padding: "4px 10px", borderRadius: "20px",
              background: connected ? "#f0fdf4" : "#fef3c7",
              color: connected ? "#16a34a" : "#d97706",
              border: `1px solid ${connected ? "#bbf7d0" : "#fde68a"}`,
            }}>
              {connected ? "🟢 Live" : "🟡 Connecting..."}
            </span>
          </div>

          <div className="chat-messages-area">
            {loading ? (
              <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "80px" }}>
                Loading messages...
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#9ca3af", marginTop: "80px" }}>
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  isSentByMe={msg.senderEmail === currentUserEmail || msg.sender === currentUserName}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder={connected ? "Type your message..." : "Connecting..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(e); }
                  }}
                />
              </div>
              <button
                type="submit"
                className={`chat-send-btn ${!newMessage.trim() ? 'disabled' : ''}`}
                disabled={!newMessage.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;