import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  // Each notification: { id, type, groupId, groupName, sender, text, time, timestamp, read }
  const [notifications, setNotifications] = useState([]);
  const seenIds  = useRef(new Set());
  const emailRef = useRef("");
  const readyRef = useRef(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    emailRef.current = user.email || "";
    if (!emailRef.current) return;

    // ── Seed seenIds with all existing messages so we don't notify on load ──
    const markAllSeen = async () => {
      try {
        const { data: groups } = await api.get("/groups/my-groups");
        await Promise.all((groups || []).map(async (g) => {
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => seenIds.current.add(`msg-${m.id}`));
          } catch (_) {}
        }));
      } catch (_) {}
      readyRef.current = true;
    };

    // ── Poll for new chat messages ──
    const poll = async () => {
      if (!readyRef.current) return;
      try {
        const { data: groups } = await api.get("/groups/my-groups");
        const newNotifs = [];
        await Promise.all((groups || []).map(async (g) => {
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => {
              const key = `msg-${m.id}`;
              if (m.senderEmail !== emailRef.current && !seenIds.current.has(key)) {
                seenIds.current.add(key);
                newNotifs.push({
                  id:        key,
                  type:      "chat",
                  groupId:   g.id,
                  groupName: g.name,
                  sender:    m.senderName || "Someone",
                  text:      m.fileUrl ? "📎 Sent a file" : (m.content || ""),
                  time:      new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  timestamp: new Date(m.sentAt),
                  read:      false,
                });
              }
            });
          } catch (_) {}
        }));
        if (newNotifs.length > 0)
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
      } catch (_) {}
    };

    markAllSeen();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Mark a single notification as read ──
  const markRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // ── Mark all as read ──
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // ── Dismiss (remove) a single notification ──
  const dismiss = useCallback((id) => {
    seenIds.current.add(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ── Clear all notifications ──
  const clearAll = useCallback(() => {
    setNotifications(prev => {
      prev.forEach(n => seenIds.current.add(n.id));
      return [];
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markRead, markAllRead, dismiss, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
