import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useNotifications } from "../context/NotificationContext";
import "../styles/Notifications.css";

const TYPE_ICONS = {
  chat:    "💬",
  session: "📅",
  default: "🔔",
};

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } =
    useNotifications();

  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"

  const filtered = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read")   return  n.read;
    return true;
  });

  const handleClick = (n) => {
    markRead(n.id);
    if (n.type === "chat" || n.groupId) {
      navigate(`/groups/${n.groupId}/chat`);
    }
  };

  const formatTime = (n) => {
    if (!n.timestamp) return n.time || "";
    const d = new Date(n.timestamp);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1)  return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)   return `${diffH}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Layout>
      <div className="notif-page-wrap">

        {/* ── Header ── */}
        <div className="notif-page-header">
          <div>
            <h1 className="notif-page-title">🔔 Notifications</h1>
            <p className="notif-page-sub">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>
          <div className="notif-page-actions">
            {unreadCount > 0 && (
              <button className="notif-page-btn outline" onClick={markAllRead}>
                ✓ Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button className="notif-page-btn danger" onClick={clearAll}>
                🗑 Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Tabs ── */}
        <div className="notif-tabs">
          {[
            { key: "all",    label: "All",    count: notifications.length },
            { key: "unread", label: "Unread", count: notifications.filter(n => !n.read).length },
            { key: "read",   label: "Read",   count: notifications.filter(n =>  n.read).length },
          ].map(tab => (
            <button
              key={tab.key}
              className={`notif-tab${filter === tab.key ? " active" : ""}`}
              onClick={() => setFilter(tab.key)}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`notif-tab-count${filter === tab.key ? " active" : ""}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notification List ── */}
        <div className="notif-list">
          {filtered.length === 0 ? (
            <div className="notif-list-empty">
              <span className="notif-list-empty-icon">
                {filter === "unread" ? "✅" : "🔔"}
              </span>
              <p>
                {filter === "unread"
                  ? "No unread notifications"
                  : filter === "read"
                  ? "No read notifications yet"
                  : "No notifications yet"}
              </p>
            </div>
          ) : (
            filtered.map(n => (
              <div
                key={n.id}
                className={`notif-list-item${n.read ? "" : " unread"}`}
                onClick={() => handleClick(n)}
              >
                {/* Unread indicator bar */}
                {!n.read && <div className="notif-list-unread-bar" />}

                {/* Icon */}
                <div className={`notif-list-icon${n.read ? "" : " unread"}`}>
                  {TYPE_ICONS[n.type] || TYPE_ICONS.default}
                </div>

                {/* Content */}
                <div className="notif-list-content">
                  <div className="notif-list-top">
                    <span className="notif-list-sender">{n.sender}</span>
                    <span className="notif-list-in"> in </span>
                    <span className="notif-list-group">{n.groupName}</span>
                    {!n.read && <span className="notif-list-new-badge">New</span>}
                  </div>
                  <div className="notif-list-text">{n.text}</div>
                  <div className="notif-list-time">{formatTime(n)}</div>
                </div>

                {/* Actions */}
                <div
                  className="notif-list-actions"
                  onClick={e => e.stopPropagation()}
                >
                  {!n.read && (
                    <button
                      className="notif-list-action-btn"
                      title="Mark as read"
                      onClick={() => markRead(n.id)}
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="notif-list-action-btn dismiss"
                    title="Dismiss"
                    onClick={() => dismiss(n.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </Layout>
  );
}
