import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const seenIds     = useRef(new Set());
  const readyRef    = useRef(false);
  const intervalRef = useRef(null);

  const getEmail  = () => { try { return JSON.parse(localStorage.getItem("user") || "{}").email || ""; } catch { return ""; } };
  const getUserId = () => { try { return JSON.parse(localStorage.getItem("user") || "{}").id   || null; } catch { return null; } };

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    seenIds.current  = new Set();
    readyRef.current = false;
    setNotifications([]);

    const email = getEmail();
    if (!email) return;

    // ── init: seed only YOUR OWN messages and sessions as seen
    // Other people's items stay UNSEEN → they will appear as notifications
    const init = async () => {
      const currentEmail  = getEmail();
      const currentUserId = getUserId();
      try {
        const { data: groups } = await api.get("/groups/my-groups");
        await Promise.all((groups || []).map(async (g) => {
          // Seed own chat messages so you don't get notified about your own
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => {
              if (m.senderEmail === currentEmail) seenIds.current.add(`msg-${m.id}`);
            });
          } catch (_) {}
          // Seed own sessions and past sessions
          try {
            const { data: sessions } = await api.get(`/groups/${g.id}/sessions`);
            const now = new Date();
            (sessions || []).forEach(s => {
              const isPast    = new Date(s.sessionDate) <= now;
              const isOwnSession = currentUserId && s.createdById === currentUserId;
              if (isPast || isOwnSession) seenIds.current.add(`session-${s.id}`);
            });
          } catch (_) {}
        }));
      } catch (_) {}
      readyRef.current = true;
    };

    // ── poll: everything NOT in seenIds triggers a notification
    const poll = async () => {
      if (!readyRef.current) return;
      const currentEmail  = getEmail();
      const currentUserId = getUserId();
      if (!currentEmail) return;

      try {
        const { data: groups } = await api.get("/groups/my-groups");
        const newNotifs = [];
        const now = new Date();

        await Promise.all((groups || []).map(async (g) => {

          // ── Chat messages from others ──────────────────────────
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => {
              const key = `msg-${m.id}`;
              if (seenIds.current.has(key)) return;
              seenIds.current.add(key);
              if (m.senderEmail === currentEmail) return; // own message — skip
              newNotifs.push({
                id:        key,
                type:      "chat",
                groupId:   g.id,
                groupName: g.name,
                sender:    m.senderName || "Someone",
                text:      m.fileUrl ? "📎 Sent a file" : (m.content || ""),
                time:      new Date(m.sentAt || m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                timestamp: new Date(m.sentAt || m.timestamp),
                read:      false,
              });
            });
          } catch (_) {}

          // ── Upcoming sessions from others ──────────────────────
          try {
            const { data: sessions } = await api.get(`/groups/${g.id}/sessions`);
            (sessions || []).forEach(s => {
              const key         = `session-${s.id}`;
              const sessionDate = new Date(s.sessionDate);
              if (seenIds.current.has(key)) return;
              seenIds.current.add(key);
              if (sessionDate <= now) return;                                    // past — skip
              if (currentUserId && s.createdById === currentUserId) return;     // own — skip
              newNotifs.push({
                id:        key,
                type:      "session",
                groupId:   g.id,
                groupName: g.name,
                sender:    s.createdByName || "Admin",
                text:      `📅 "${s.title}" — ${sessionDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
                time:      sessionDate.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                timestamp: sessionDate,
                read:      false,
                sessionId: s.id,
              });
            });
          } catch (_) {}
        }));

        if (newNotifs.length > 0)
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
      } catch (_) {}
    };

    // init first, then immediately poll so notifications appear right after login
    init().then(() => poll());
    intervalRef.current = setInterval(poll, 5000);
  }, []);

  useEffect(() => {
    startPolling();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startPolling]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "user") startPolling(); };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [startPolling]);

  const refreshNotifications = useCallback(() => startPolling(), [startPolling]);
  const markRead    = useCallback((id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAllRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const dismiss     = useCallback((id) => { seenIds.current.add(id); setNotifications(prev => prev.filter(n => n.id !== id)); }, []);
  const clearAll    = useCallback(() => setNotifications(prev => { prev.forEach(n => seenIds.current.add(n.id)); return []; }), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, dismiss, clearAll, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
