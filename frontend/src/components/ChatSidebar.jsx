import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatSidebar({ groups, activeGroupId, unreadMap, darkMode }) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filtered = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`cs-sidebar ${darkMode ? "dark" : ""}`}>
      <div className="cs-sidebar-header">
        <h2 className="cs-logo">💬 StudyChat</h2>
        <div className="cs-search-wrap">
          <span className="cs-search-icon">🔍</span>
          <input
            className="cs-search-input"
            placeholder="Search groups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="cs-group-label">YOUR GROUPS</div>

      <div className="cs-group-list">
        {filtered.length === 0 && (
          <div className="cs-empty">No groups found</div>
        )}
        {filtered.map(g => {
          const isActive = String(g.id) === String(activeGroupId);
          const unread = unreadMap?.[g.id] || 0;
          const initial = g.name?.charAt(0).toUpperCase() || "G";
          return (
            <div
              key={g.id}
              className={`cs-group-item ${isActive ? "active" : ""}`}
              onClick={() => navigate(`/groups/${g.id}/chat`)}
            >
              <div className="cs-group-avatar">{initial}</div>
              <div className="cs-group-info">
                <div className="cs-group-name">{g.name}</div>
                <div className="cs-group-preview">
                  {g.lastMessage || "Click to open chat"}
                </div>
              </div>
              <div className="cs-group-meta">
                {g.lastTime && <span className="cs-group-time">{g.lastTime}</span>}
                {unread > 0 && (
                  <span className="cs-unread-badge">{unread > 9 ? "9+" : unread}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="cs-sidebar-footer">
        <button className="cs-back-btn" onClick={() => navigate("/groups")}>
          ← All Groups
        </button>
      </div>
    </div>
  );
}
