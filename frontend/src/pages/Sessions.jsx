import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import SessionCalendar from "../components/SessionCalendar";
import api from "../services/api";
import { createSession, getGroupSessions, deleteSession } from "../services/sessionService";
import "../styles/Sessions.css";

export default function Sessions() {
  const { groupId } = useParams();
  const navigate    = useNavigate();

  const [sessions,    setSessions]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [currentUser, setCurrentUser] = useState({});
  const [isAdmin,     setIsAdmin]     = useState(false);
  const [groupName,   setGroupName]   = useState("");
  const [showModal,   setShowModal]   = useState(false);
  const [activeTab,   setActiveTab]   = useState("calendar"); // "calendar" | "list"
  const [form,        setForm]        = useState({ title: "", description: "", sessionDate: "" });
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState("");
  const [toast,       setToast]       = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    fetchData(user);
  }, [groupId]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setShowModal(false);
    };
    if (showModal) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showModal]);

  const fetchData = async (user) => {
    try {
      const [sessRes, membersRes, groupRes] = await Promise.all([
        getGroupSessions(groupId),
        api.get(`/groups/${groupId}/members`),
        api.get(`/groups/${groupId}`),
      ]);
      setSessions(sessRes);
      setGroupName(groupRes.data.name || "");
      const me = membersRes.data.find(m => m.email === (user?.email || ""));
      setIsAdmin(me?.role === "ADMIN");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.sessionDate) {
      setError("Title and date/time are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const created = await createSession(groupId, {
        title: form.title,
        description: form.description,
        sessionDate: form.sessionDate,
      });
      setSessions(prev =>
        [...prev, created].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
      );
      setForm({ title: "", description: "", sessionDate: "" });
      setShowModal(false);
      showToast("Session scheduled successfully! 🎉");
    } catch (e) {
     setError(e.response?.data?.error || "Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(groupId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      showToast("Session deleted.", "info");
    } catch (e) {
      alert(e.response?.data || "Failed to delete session.");
    }
  };

  const canDelete = (s) => isAdmin || s.createdById === currentUser?.id;

  const now      = new Date();
  const upcoming = sessions.filter(s => new Date(s.sessionDate) >= now);
  const past     = sessions.filter(s => new Date(s.sessionDate) <  now);

  // Next session countdown
  const nextSession = upcoming[0];
  const getCountdown = (dt) => {
    const diff = new Date(dt) - now;
    if (diff <= 0) return null;
    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    if (days > 0)  return `${days}d ${hours}h away`;
    if (hours > 0) return `${hours}h ${mins}m away`;
    return `${mins}m away`;
  };

  const fmt = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const fmtShort = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });

  if (loading) return (
    <Layout>
      <div className="sp-loading">
        <div className="sp-spinner" />
        <p>Loading sessions…</p>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="sp-wrap">

        {/* ── Toast ── */}
        {toast && (
          <div className={`sp-toast ${toast.type}`}>
            {toast.type === "success" ? "✅" : "ℹ️"} {toast.msg}
          </div>
        )}

        {/* ── Hero Banner ── */}
        <div className="sp-hero">
          <div className="sp-hero-bg" />
          <div className="sp-hero-orb sp-hero-orb1" />
          <div className="sp-hero-orb sp-hero-orb2" />

          <div className="sp-hero-left">
            <div className="sp-hero-icon">📅</div>
            <div>
              <div className="sp-hero-eyebrow">Study Sessions</div>
              <h1 className="sp-hero-title">{groupName}</h1>
              <p className="sp-hero-sub">
                {upcoming.length > 0
                  ? `${upcoming.length} upcoming session${upcoming.length > 1 ? "s" : ""} scheduled`
                  : "No upcoming sessions — schedule one!"}
              </p>
            </div>
          </div>

          <div className="sp-hero-right">
            {nextSession && (
              <div className="sp-next-card">
                <div className="sp-next-label">Next Session</div>
                <div className="sp-next-title">{nextSession.title}</div>
                <div className="sp-next-time">{fmtShort(nextSession.sessionDate)}</div>
                <div className="sp-next-countdown">{getCountdown(nextSession.sessionDate)}</div>
              </div>
            )}
            <button className="sp-hero-btn" onClick={() => setShowModal(true)}>
              <span className="sp-hero-btn-icon">+</span>
              Schedule Session
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="sp-stats">
          {[
            { icon: "📋", label: "Total",    value: sessions.length,  color: "#6366f1", bg: "#eef2ff" },
            { icon: "⏰", label: "Upcoming", value: upcoming.length,  color: "#16a34a", bg: "#dcfce7" },
            { icon: "✅", label: "Completed",value: past.length,      color: "#0284c7", bg: "#e0f2fe" },
          ].map(s => (
            <div key={s.label} className="sp-stat-card">
              <div className="sp-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="sp-stat-num"  style={{ color: s.color }}>{s.value}</div>
              <div className="sp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div className="sp-tabs">
          <button
            className={`sp-tab${activeTab === "calendar" ? " active" : ""}`}
            onClick={() => setActiveTab("calendar")}
          >
            🗓 Calendar View
          </button>
          <button
            className={`sp-tab${activeTab === "list" ? " active" : ""}`}
            onClick={() => setActiveTab("list")}
          >
            📋 List View
          </button>
          <button className="sp-tab-back" onClick={() => navigate(`/groups/${groupId}`)}>
            ← Back to Group
          </button>
        </div>

        {/* ── Calendar View ── */}
        {activeTab === "calendar" && (
          <SessionCalendar
            sessions={sessions}
            onDelete={handleDelete}
            canDelete={canDelete}
          />
        )}

        {/* ── List View ── */}
        {activeTab === "list" && (
          <div className="sp-list-wrap">

            {/* Upcoming */}
            <div className="sp-list-section">
              <div className="sp-list-section-hdr">
                <span className="sp-list-section-dot upcoming" />
                <h2>Upcoming Sessions</h2>
                <span className="sp-list-badge upcoming">{upcoming.length}</span>
              </div>

              {upcoming.length === 0 ? (
                <div className="sp-empty-state">
                  <div className="sp-empty-icon">🗓</div>
                  <p>No upcoming sessions yet.</p>
                  <button className="sp-empty-btn" onClick={() => setShowModal(true)}>
                    + Schedule your first session
                  </button>
                </div>
              ) : (
                <div className="sp-cards-grid">
                  {upcoming.map((s, i) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      fmt={fmt}
                      canDelete={canDelete(s)}
                      onDelete={handleDelete}
                      upcoming
                      index={i}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div className="sp-list-section">
                <div className="sp-list-section-hdr">
                  <span className="sp-list-section-dot past" />
                  <h2>Past Sessions</h2>
                  <span className="sp-list-badge past">{past.length}</span>
                </div>
                <div className="sp-cards-grid">
                  {[...past].reverse().map((s, i) => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      fmt={fmt}
                      canDelete={canDelete(s)}
                      onDelete={handleDelete}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Schedule Modal ── */}
        {showModal && (
          <div className="sp-modal-overlay">
            <div className="sp-modal" ref={modalRef}>
              <div className="sp-modal-header">
                <div className="sp-modal-title-wrap">
                  <div className="sp-modal-icon">📅</div>
                  <div>
                    <h2>Schedule a Session</h2>
                    <p>Add a new study session for <strong>{groupName}</strong></p>
                  </div>
                </div>
                <button className="sp-modal-close" onClick={() => { setShowModal(false); setError(""); }}>✕</button>
              </div>

              {error && <div className="sp-modal-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit} className="sp-modal-form">
                <div className="sp-field">
                  <label>Session Title <span className="sp-required">*</span></label>
                  <input
                    className="sp-input"
                    placeholder="e.g. Chapter 5 Review, Mock Exam Prep…"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="sp-field">
                  <label>Description <span className="sp-optional">(optional)</span></label>
                  <textarea
                    className="sp-input sp-textarea"
                    placeholder="What will you cover? Any prep needed?"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="sp-field">
                  <label>Date & Time <span className="sp-required">*</span></label>
                  <input
                    className="sp-input"
                    type="datetime-local"
                    value={form.sessionDate}
                    onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))}
                  />
                </div>

                <div className="sp-modal-actions">
                  <button
                    type="button"
                    className="sp-btn-cancel"
                    onClick={() => { setShowModal(false); setError(""); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="sp-btn-submit" disabled={submitting}>
                    {submitting ? (
                      <><span className="sp-btn-spinner" /> Saving…</>
                    ) : (
                      "✓ Schedule Session"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

function SessionCard({ session, fmt, canDelete, onDelete, upcoming, index }) {
  const d = new Date(session.sessionDate);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isTomorrow = new Date(now.getTime() + 86400000).toDateString() === d.toDateString();

  const tag = isToday ? "Today" : isTomorrow ? "Tomorrow" : null;

  return (
    <div
      className={`sp-card${upcoming ? " upcoming" : " past"}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {tag && <div className="sp-card-tag">{tag}</div>}

      <div className="sp-card-top">
        <div className="sp-card-date-block">
          <span className="sp-card-day">{d.getDate()}</span>
          <span className="sp-card-month">
            {d.toLocaleString("en-US", { month: "short" }).toUpperCase()}
          </span>
        </div>
        <div className="sp-card-time-block">
          <span className="sp-card-time">
            {d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="sp-card-weekday">
            {d.toLocaleString("en-US", { weekday: "long" })}
          </span>
        </div>
      </div>

      <div className="sp-card-divider" />

      <div className="sp-card-body">
        <div className="sp-card-title">{session.title}</div>
        {session.description && (
          <div className="sp-card-desc">{session.description}</div>
        )}
      </div>

      <div className="sp-card-footer">
        <div className="sp-card-avatar">{session.createdByName?.[0]?.toUpperCase()}</div>
        <span className="sp-card-creator">{session.createdByName}</span>
        {canDelete && (
          <button
            className="sp-card-del"
            onClick={() => onDelete(session.id)}
            title="Delete session"
          >
            🗑
          </button>
        )}
      </div>
    </div>
  );
}
