import { useState } from "react";
import "./SessionCalendar.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/**
 * SessionCalendar
 * Props:
 *   sessions      — array of SessionResponse from backend
 *   onDayClick    — optional callback(date, sessionsOnDay)
 *   onDelete      — optional callback(sessionId) — shown only when canDelete
 *   canDelete     — fn(session) => bool
 */
export default function SessionCalendar({ sessions = [], onDelete, canDelete }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(null); // { date, sessions }

  // ── Build calendar grid ──────────────────────────────────────
  const firstDay  = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];

  // leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  // day cells
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  // ── Map sessions to dates ────────────────────────────────────
  const sessionsByDate = {};
  sessions.forEach(s => {
    const d = new Date(s.sessionDate);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!sessionsByDate[key]) sessionsByDate[key] = [];
    sessionsByDate[key].push(s);
  });

  const getSessionsForDate = (date) => {
    if (!date) return [];
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return sessionsByDate[key] || [];
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelected(null);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelected(null);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const daySessions = getSessionsForDate(date);
    setSelected(prev =>
      prev && isSameDay(prev.date, date) ? null : { date, sessions: daySessions }
    );
  };

  const formatTime = (dt) =>
    new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const formatFullDate = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="sc-wrap">

      {/* ── Header ── */}
      <div className="sc-header">
        <button className="sc-nav-btn" onClick={prevMonth}>‹</button>
        <span className="sc-month-label">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="sc-nav-btn" onClick={nextMonth}>›</button>
      </div>

      {/* ── Day-of-week row ── */}
      <div className="sc-dow-row">
        {DAYS.map(d => <div key={d} className="sc-dow">{d}</div>)}
      </div>

      {/* ── Calendar grid ── */}
      <div className="sc-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="sc-cell empty" />;

          const daySessions = getSessionsForDate(date);
          const isToday     = isSameDay(date, today);
          const isSelected  = selected && isSameDay(selected.date, date);
          const hasSessions = daySessions.length > 0;

          return (
            <div
              key={date.toISOString()}
              className={[
                "sc-cell",
                isToday    ? "today"    : "",
                isSelected ? "selected" : "",
                hasSessions ? "has-sessions" : "",
              ].join(" ")}
              onClick={() => handleDayClick(date)}
            >
              <span className="sc-day-num">{date.getDate()}</span>
              {hasSessions && (
                <div className="sc-dots">
                  {daySessions.slice(0, 3).map((_, idx) => (
                    <span key={idx} className="sc-dot" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Selected day panel ── */}
      {selected && (
        <div className="sc-detail-panel">
          <div className="sc-detail-header">
            <span className="sc-detail-date">📅 {formatFullDate(selected.date)}</span>
            <button className="sc-detail-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          {selected.sessions.length === 0 ? (
            <p className="sc-detail-empty">No sessions scheduled for this day.</p>
          ) : (
            selected.sessions.map(s => (
              <div key={s.id} className="sc-session-item">
                <div className="sc-session-time">{formatTime(s.sessionDate)}</div>
                <div className="sc-session-body">
                  <div className="sc-session-title">{s.title}</div>
                  {s.description && (
                    <div className="sc-session-desc">{s.description}</div>
                  )}
                  <div className="sc-session-meta">Scheduled by {s.createdByName}</div>
                </div>
                {canDelete && canDelete(s) && (
                  <button
                    className="sc-session-del"
                    onClick={() => onDelete && onDelete(s.id)}
                    title="Delete session"
                  >
                    🗑
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
