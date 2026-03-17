import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const prevMsgIds = useRef(new Set());
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const init = async () => {
      try {
        const groupsRes = await api.get("/groups/my-groups");
        const groups = groupsRes.data || [];
        await Promise.all(groups.map(async (g) => {
          try {
            const res = await api.get(`/groups/${g.id}/chat`);
            // Only mark YOUR OWN messages as already seen — others' messages
            // should still trigger notifications on next poll
            (res.data || []).forEach(m => {
              if (m.senderEmail === currentUser.email) {
                prevMsgIds.current.add(m.id);
              }
            });
          } catch (_) {}
        }));
        // After marking own messages, do one poll immediately to catch
        // existing unread messages from others
        await poll();
      } catch (_) {}
    };

    const poll = async () => {
      try {
        const groupsRes = await api.get("/groups/my-groups");
        const groups = groupsRes.data || [];
        const newNotifs = [];
        await Promise.all(groups.map(async (g) => {
          try {
            const res = await api.get(`/groups/${g.id}/chat`);
            const msgs = res.data || [];
            msgs.forEach(m => {
              if (
                m.senderEmail !== currentUser.email &&
                !prevMsgIds.current.has(m.id)
              ) {
                prevMsgIds.current.add(m.id);
                newNotifs.push({
                  id: m.id,
                  groupId: g.id,
                  groupName: g.name,
                  sender: m.senderName || "Someone",
                  text: m.content || "Sent a file",
                  time: new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
              }
            });
          } catch (_) {}
        }));
        if (newNotifs.length > 0) setNotifications(prev => [...newNotifs, ...prev].slice(0, 20));
      } catch (_) {}
    };

    init().then(() => {
      const interval = setInterval(poll, 5000);
      return () => clearInterval(interval);
    });
  }, [currentUser.email]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (n) => {
    navigate(`/groups/${n.groupId}/chat`);
    setNotifications(prev => prev.filter(x => x.id !== n.id));
    setShowNotifs(false);
  };

  return (
    <div className="notif-wrap" ref={notifRef}>
      <button className="notif-btn" onClick={() => setShowNotifs(p => !p)} title="Notifications">
        🔔
        {notifications.length > 0 && (
          <span className="notif-badge">{notifications.length > 9 ? "9+" : notifications.length}</span>
        )}
      </button>
      {showNotifs && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>Notifications</span>
            {notifications.length > 0 && (
              <button className="notif-clear-btn" onClick={() => setNotifications([])}>Clear all</button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="notif-empty">No new notifications</div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className="notif-item" onClick={() => handleClick(n)}>
                <div className="notif-item-avatar">{n.sender.charAt(0).toUpperCase()}</div>
                <div className="notif-item-body">
                  <div className="notif-item-title"><strong>{n.sender}</strong> in {n.groupName}</div>
                  <div className="notif-item-text">{n.text}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
