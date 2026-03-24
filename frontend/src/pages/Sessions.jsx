import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import SessionCalendar from "../components/SessionCalendar";
import api from "../services/api";
import {
  createSession,
  getGroupSessions,
  deleteSession,
} from "../services/sessionService";
import "../styles/Sessions.css";

export default function Sessions() {
  const { groupId } = useParams();

  const [sessions,       setSessions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [currentUser,    setCurrentUser]    = useState({});
  const [isAdmin,        setIsAdmin]        = useState(false);
  const [showForm,       setShowForm]       = useState(false);
  const [form,           setForm]           = useState({ title: "", description: "", sessionDate: "" });
  const [submitting,     setSubmitting]     = useState(false);
  const [error,          setError]          = useState("");
  const [groupName,      setGroupName]      = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
    fetchData(user);
  }, [groupId]);

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
      setSessions(prev => [...prev, created].sort(
        (a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)
      ));
      setForm({ title: "", description: "", sessionDate: "" });
      setShowForm(false);
    } catch (e) {
      setError(e.response?.data || "Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(groupId, sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e) {
      alert(e.response?.data || "Failed to delete session.");
    }
  };

  const canDelete = (s) =>
    isAdmin || s.createdById === currentUser?.id;

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.sessionDate) >= now);
  const past     = sessions.filter(s => new Date(s.sessionDate) <  now);

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  if (loading) return (
    <Layout>
      <div className="sess-wrapper"><p className="sess-empty">Loading sessions...</p></div>
    </Layout>
  );

  return (
    <Layout>
      <div className="sess-wrapper">

        {/* ── Page Header ── */}
        <div className="sess-page-header">
          <div>
            <h1 className="sess-title">📅 Study Sessions</h1>
            <p className="sess-subtitle">{groupName} · Schedule and track group study sessions</p>
          </div>
          <button className="sess-btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Cancel" : "+ Schedule Session"}
          </button>
        </div>

        {/* ── Create Form ── */}
        {showForm && (
          <div className="sess-form-card">
            <h3>New Session</h3>
            {error && <p className="sess-error">{error}</p>}
            <form onSubmit={handleSubmit} className="sess-form">
              <input
                className="sess-input"
                placeholder="Session title *"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="sess-input sess-textarea"
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className="sess-form-row">
                <label className="sess-label">Date & Time *</label>
                <input
                  className="sess-input"
                  type="datetime-local"
                  value={form.sessionDate}
                  onChange={e => setForm(f => ({ ...f, sessionDate: e.target.value }))}
                />
              </div>
              <button className="sess-btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Create Session"}
              </button>
            </form>
          </div>
        )}

        {/* ── Calendar ── */}
        <SessionCalendar
          sessions={sessions}
          onDelete={handleDelete}
          canDelete={canDelete}
        />

        {/* ── Upcoming list ── */}
        <div className="sess-section">
          <div className="sess-section-header">
            <h2>⏰ Upcoming Sessions</h2>
            <span className="sess-badge green">{upcoming.length}</span>
          </div>
          {upcoming.length === 0
            ? <p className="sess-empty">No upcoming sessions. Schedule one above!</p>
            : upcoming.map(s => (
              <SessionRow
                key={s.id}
                session={s}
                formatDateTime={formatDateTime}
                canDelete={canDelete(s)}
                onDelete={handleDelete}
                upcoming
              />
            ))
          }
        </div>

        {/* ── Past sessions ── */}
        {past.length > 0 && (
          <div className="sess-section">
            <div className="sess-section-header">
              <h2>🕐 Past Sessions</h2>
              <span className="sess-badge gray">{past.length}</span>
            </div>
            {[...past].reverse().map(s => (
              <SessionRow
                key={s.id}
                session={s}
                formatDateTime={formatDateTime}
                canDelete={canDelete(s)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}

function SessionRow({ session, formatDateTime, canDelete, onDelete, upcoming }) {
  const d = new Date(session.sessionDate);
  return (
    <div className={`sess-row${upcoming ? " upcoming" : " past"}`}>
      <div className="sess-row-date">
        <span className="sess-row-day">{d.getDate()}</span>
        <span className="sess-row-month">
          {d.toLocaleString("en-US", { month: "short" })}
        </span>
      </div>
      <div className="sess-row-body">
        <div className="sess-row-title">{session.title}</div>
        {session.description && (
          <div className="sess-row-desc">{session.description}</div>
        )}
        <div className="sess-row-meta">
          🕐 {formatDateTime(session.sessionDate)} · by {session.createdByName}
        </div>
      </div>
      {canDelete && (
        <button className="sess-row-del" onClick={() => onDelete(session.id)}>🗑</button>
      )}
    </div>
  );
}
