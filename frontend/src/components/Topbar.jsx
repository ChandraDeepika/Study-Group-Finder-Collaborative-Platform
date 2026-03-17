import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/topbar.css";
import ProfileDropdown from "./ProfileDropdown";
import api from "../services/api";

export default function Topbar() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const prevMsgIds = useRef(new Set());
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // Poll my groups for new messages every 5s
  useEffect(() => {
    const poll = async () => {
      try {
        const groupsRes = await api.get("/groups/my-groups");
        const groups = groupsRes.data || [];
        const newNotifs = [];

        await Promise.all(groups.map(async (g) => {
          try {
            const res = await api.get(`/groups/${g.id}/chat`);
            const msgs = res.data || [];
            if (msgs.length === 0) return;
            const latest = msgs[msgs.length - 1];
            if (
              latest &&
              latest.senderEmail !== currentUser.email &&
              !prevMsgIds.current.has(latest.id)
            ) {
              prevMsgIds.current.add(latest.id);
              newNotifs.push({
                id: latest.id,
                groupId: g.id,
                groupName: g.name,
                sender: latest.senderName || "Someone",
                text: latest.content || "Sent a file",
                time: new Date(latest.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
            }
          } catch (_) {}
        }));

        if (newNotifs.length > 0) {
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20));
        }
      } catch (_) {}
    };

    // init: mark existing as seen so we don't flood on first load
    const init = async () => {
      try {
        const groupsRes = await api.get("/groups/my-groups");
        const groups = groupsRes.data || [];
        await Promise.all(groups.map(async (g) => {
          try {
            const res = await api.get(`/groups/${g.id}/chat`);
            const msgs = res.data || [];
            msgs.forEach(m => prevMsgIds.current.add(m.id));
          } catch (_) {}
        }));
      } catch (_) {}
    };

    init().then(() => {
      const interval = setInterval(poll, 5000);
      return () => clearInterval(interval);
    });
  }, [currentUser.email]);

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

  const unreadCount = notifications.length;

  const handleNotifClick = (n) => {
    navigate(`/groups/${n.groupId}/chat`);
    setNotifications(prev => prev.filter(x => x.id !== n.id));
    setShowNotifs(false);
  };

  const clearAll = () => setNotifications([]);

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
