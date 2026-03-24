import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/topbar.css";
import ProfileDropdown from "./ProfileDropdown";
import { useNotifications } from "../context/NotificationContext";

export default function Topbar() {
  const navigate = useNavigate();
  const { notifications, clearAll, dismiss } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.length;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifClick = (n) => {
    navigate(`/groups/${n.groupId}/chat`);
    dismiss(n.id);
    setShowNotifs(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <input type="text" placeholder="Search..." className="search-input" />

        <div className="topbar-right">
          {/* Notification Bell */}
          <div className="notif-wrap" ref={notifRef}>
            <button
              className="notif-btn"
              onClick={() => setShowNotifs(p => !p)}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="notif-panel">
                <div className="notif-panel-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button className="notif-clear-btn" onClick={clearAll}>
                      Clear all
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className="notif-item"
                      onClick={() => handleNotifClick(n)}
                    >
                      <div className="notif-item-avatar">
                        {n.sender.charAt(0).toUpperCase()}
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
              </div>
            )}
          </div>

          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}
