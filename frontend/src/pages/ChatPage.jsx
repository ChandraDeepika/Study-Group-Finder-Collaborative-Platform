import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/ChatPage.css';
import MessageItem from '../components/MessageItem';

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  // Mock data as requested
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", text: "Hello everyone!", time: "10:30" },
    { id: 2, sender: "Bob", text: "Hi Alice! Ready to study?", time: "10:32" },
    { id: 3, sender: "Charlie", text: "Hey! Let's get started on Chapter 4.", time: "10:35" }
  ]);
  
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Hardcoded current user for styling purposes (sent vs received bubbles)
  const currentUser = "Alice";

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsgObj = {
      id: messages.length + 1,
      sender: currentUser,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Simple HH:MM format
    };

    setMessages([...messages, newMsgObj]);
    setNewMessage("");
  };

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <button 
          onClick={() => navigate(groupId ? `/groups/${groupId}` : '/groups')}
          style={{ 
            marginBottom: '16px', 
            background: 'transparent', 
            border: 'none', 
            color: '#3b82f6', 
            cursor: 'pointer', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '1rem'
          }}
        >
          ⬅ {groupId ? 'Back to Group' : 'Back to Groups'}
        </button>
        <div className="chat-page-container">
      {/* Top Section: Header */}
      <div className="chat-header">
        <h2>Study Group Chat</h2>
        {/* Optional: Add members count or info icon here later */}
      </div>

      {/* Middle Section: Scrollable Messages */}
      <div className="chat-messages-area">
        {messages.map((msg) => {
          const isSentByMe = msg.sender === currentUser;
          return (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              isSentByMe={isSentByMe} 
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Section: Input */}
      <div className="chat-input-container">
        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <div className="chat-input-wrapper">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent accidental form submission reload
                  handleSendMessage(e);
                }
              }}
            />
          </div>
          <button 
            type="submit" 
            className={`chat-send-btn ${!newMessage.trim() ? 'disabled' : ''}`}
            disabled={!newMessage.trim()}
          >
            {/* Simple SVG Send Icon */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              width="20" 
              height="20"
            >
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
