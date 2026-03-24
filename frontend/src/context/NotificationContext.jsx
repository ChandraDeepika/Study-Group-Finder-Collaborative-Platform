import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../services/api";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const seenIds      = useRef(new Set());
  const emailRef     = useRef("");
  const readyRef     = useRef(false); // true only after init completes

  useEffect(() => {
    // Read email once — never re-run this effect
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    emailRef.current = user.email || "";
    if (!emailRef.current) return;

    const markAllSeen = async () => {
      try {
        const { data: groups } = await api.get("/groups/my-groups");
        await Promise.all((groups || []).map(async (g) => {
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => seenIds.current.add(m.id));
          } catch (_) {}
        }));
      } catch (_) {}
      readyRef.current = true;
    };

    const poll = async () => {
      if (!readyRef.current) return;
      try {
        const { data: groups } = await api.get("/groups/my-groups");
        const newNotifs = [];
        await Promise.all((groups || []).map(async (g) => {
          try {
            const { data: msgs } = await api.get(`/groups/${g.id}/chat`);
            (msgs || []).forEach(m => {
              if (m.senderEmail !== emailRef.current && !seenIds.current.has(m.id)) {
                seenIds.current.add(m.id);
                newNotifs.push({
                  id:        m.id,
                  groupId:   g.id,
                  groupName: g.name,
                  sender:    m.senderName || "Someone",
                  text:      m.fileUrl ? "📎 Sent a file" : (m.content || ""),
                  time:      new Date(m.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
              }
            });
          } catch (_) {}
        }));
        if (newNotifs.length > 0)
          setNotifications(prev => [...newNotifs, ...prev].slice(0, 20));
      } catch (_) {}
    };

    markAllSeen();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []); // ← empty deps: runs exactly once, no stale-closure issues

  const clearAll = () => {
    setNotifications(prev => {
      prev.forEach(n => seenIds.current.add(n.id));
      return [];
    });
  };

  const dismiss = (id) => {
    seenIds.current.add(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, clearAll, dismiss }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
