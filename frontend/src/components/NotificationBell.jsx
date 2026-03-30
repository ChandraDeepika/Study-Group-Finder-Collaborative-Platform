import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const TYPE_ICON = { chat: "💬", session: "📅", default: "🔔" };

export default function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (n) => {
    markRead(n.id);
    setOpen(false);
    if (n.type === "session") {
      navigate(`/groups/${n.groupId}/sessions`);
    } else {
      navigate(`/groups/${n.groupId}/chat`);
    }
  };

  const preview = notifications.slice(0, 5);

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-btn" onClick={() => setOpen(p => !p)} title="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>
              Notifications
              {unreadCount > 0 && (
                <span className="notif-unread-label">{unreadCount} new</span>
              )}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <button className="notif-clear-btn" onClick={markAllRead}>Mark all read</button>
              )}
              {notifications.length > 0 && (
                <button className="notif-clear-btn" onClick={clearAll}>Clear</button>
              )}
            </div>
          </div>

          {preview.length === 0 ? (
            <div className="notif-empty">No new notifications</div>
          ) : (
            preview.map(n => (
              <div
                key={n.id}
                className={`notif-item${n.read ? "" : " unread"}`}
                onClick={() => handleClick(n)}
              >
                {!n.read && <span className="notif-unread-dot" />}
                <div className="notif-item-avatar">
                  {TYPE_ICON[n.type] || TYPE_ICON.default}
                </div>
                <div className="notif-item-body">
                  <div className="notif-item-title">
                    <strong>{n.sender}</strong> in {n.groupName}
                  </div>
                  <div className="notif-item-text">{n.text}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
              </div>
            ))
          )}

          {notifications.length > 0 && (
            <button className="notif-see-all" onClick={() => { markAllRead(); navigate("/notifications"); setOpen(false); }}>
              See all notifications →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
