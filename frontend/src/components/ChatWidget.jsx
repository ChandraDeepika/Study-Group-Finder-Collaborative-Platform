import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ChatWidget.css";

export default function ChatWidget() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get("/groups/my-groups")
      .then(res => {
        setGroups(res.data || []);
        setUnread(res.data?.length > 0 ? 1 : 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="chat-widget-wrap">
      {open && (
        <div className="chat-widget-panel">
          <div className="cwp-header">
            <span>💬 My Chats</span>
            <button className="cwp-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="cwp-list">
            {groups.length === 0 ? (
              <div className="cwp-empty">
                <span>🏫</span>
                <p>Join a group to start chatting</p>
                <button onClick={() => { navigate("/groups"); setOpen(false); }}>Browse Groups</button>
              </div>
            ) : (
              groups.map(g => (
                <div
                  key={g.id}
                  className="cwp-item"
                  onClick={() => { navigate(`/groups/${g.id}/chat`); setOpen(false); }}
                >
                  <div className="cwp-avatar">{g.name?.[0]?.toUpperCase()}</div>
                  <div className="cwp-info">
                    <span className="cwp-name">{g.name}</span>
                    <span className="cwp-sub">{g.privacy === "PRIVATE" ? "🔒 Private" : "🌐 Public"}</span>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <button
        className={`chat-widget-btn ${open ? "active" : ""}`}
        onClick={() => setOpen(o => !o)}
        title="Open Chats"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
        )}
        {!open && unread > 0 && <span className="chat-widget-badge">{unread}</span>}
      </button>
    </div>
  );
}
