import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import "../styles/ChatPage.css";

const ChatPage = () => {

  const { groupId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  // current user from localStorage (set at login)
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    // poll every 3 seconds so other users' messages appear
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ======================
  // FETCH MESSAGES
  // ======================

  const fetchMessages = async () => {

    try {

      // api.js interceptor automatically adds Authorization: Bearer <token>
      const res = await api.get(`/groups/${groupId}/chat`);

      const formatted = res.data.map((msg) => ({
        id: msg.id,
        sender: msg.senderName || "User",
        senderEmail: msg.senderEmail || "",
        text: msg.content,
        // backend returns sentAt (ChatMessageResponse.sentAt)
        time: new Date(msg.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      }));

      setMessages(formatted);

    } catch (err) {

      console.error("Error loading messages:", err);

    }

  };

  // ======================
  // SEND MESSAGE
  // ======================

  const handleSendMessage = async (e) => {

    e.preventDefault();

    if (!newMessage.trim()) return;

    try {

      // api.js interceptor automatically adds Authorization: Bearer <token>
      const res = await api.post(`/groups/${groupId}/chat`, {
        content: newMessage,
        messageType: "TEXT",
        fileUrl: null
      });

      const msg = {
        id: res.data.id,
        sender: res.data.senderName || "You",
        senderEmail: res.data.senderEmail || "",
        text: res.data.content,
        time: new Date(res.data.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      setMessages(prev => [...prev, msg]);

      setNewMessage("");

    } catch (err) {

      console.error("Send message failed:", err);

    }

  };

  return (

    <Layout>

      <div className="chat-wrapper">

        <button
          className="back-btn"
          onClick={() => navigate(`/groups/${groupId}`)}
        >
          ← Back to Group
        </button>

        <div className="chat-container">

          <div className="chat-header">
            <h2>Study Group Chat</h2>
          </div>

          <div className="chat-messages">

            {messages.length === 0 && (
              <div className="empty-chat">
                <p>No messages yet. Be the first to say something!</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderEmail === currentUser.email;
              return (
                <div
                  key={msg.id}
                  className={`message-row ${isMe ? "me" : "other"}`}
                >

                  {!isMe && (
                    <div className="avatar">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="message-bubble">
                    {!isMe && (
                      <div className="sender-name">{msg.sender}</div>
                    )}
                    <div className="message-text">{msg.text}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>

                </div>
              );
            })}

            <div ref={messagesEndRef} />

          </div>

          <form
            className="chat-input-area"
            onSubmit={handleSendMessage}
          >

            <input
              type="text"
              placeholder="Type message..."
              value={newMessage}
              onChange={(e) =>
                setNewMessage(e.target.value)
              }
            />

            <button type="submit">
              ➤
            </button>

          </form>

        </div>

      </div>

    </Layout>

  );

};

export default ChatPage;