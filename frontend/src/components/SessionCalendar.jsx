import { useState } from "react";
import "./SessionCalendar.css";

const DAYS_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

function isBeforeToday(date) {
  const t = new Date();
  t.setHours(0,0,0,0);
  return date < t;
}

/**
 * SessionCalendar — Premium redesign
 * Props:
 *   sessions  — SessionResponse[]
 *   onDelete  — (sessionId) => void
 *   canDelete — (session) => bool
 */
export default function SessionCalendar({ sessions = [], onDelete, canDelete }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(null);

  // ── Build grid ───────────────────────────────────────────────
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++)    cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));

  // ── Session map ──────────────────────────────────────────────
  const byDate = {};
  sessions.forEach(s => {
    const d   = new Date(s.sessionDate);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    (byDate[key] = byDate[key] || []).push(s);
  });

  const sessionsFor = (date) => {
    if (!date) return [];
    return byDate[`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`] || [];
  };

  const prevMonth = () => {
    setSelected(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    setSelected(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelected(null);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const s = sessionsFor(date);
    setSelected(prev => prev && isSameDay(prev.date, date) ? null : { date, sessions: s });
  };

  const fmtTime = (dt) =>
    new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const fmtFullDate = (date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

  // Total sessions this month
  const monthSessions = sessions.filter(s => {
    const d = new Date(s.sessionDate);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  return (
    <div className="sc-wrap">

      {/* ── Calendar Header ── */}
      <div className="sc-header">
        <div className="sc-header-left">
          <h2 className="sc-month-title">
            {MONTHS_FULL[viewMonth]}
            <span className="sc-year">{viewYear}</span>
          </h2>
          {monthSessions.length > 0 && (
            <span className="sc-month-count">
              {monthSessions.length} session{monthSessions.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="sc-header-right">
          <button className="sc-today-btn" onClick={goToday}>Today</button>
          <div className="sc-nav-group">
            <button className="sc-nav-btn" onClick={prevMonth} aria-label="Previous month">‹</button>
            <button className="sc-nav-btn" onClick={nextMonth} aria-label="Next month">›</button>
          </div>
        </div>
      </div>

      {/* ── Day-of-week labels ── */}
      <div className="sc-dow-row">
        {DAYS_SHORT.map(d => (
          <div key={d} className="sc-dow">{d}</div>
        ))}
      </div>

      {/* ── Calendar Grid ── */}
      <div className="sc-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="sc-cell empty" />;

          const daySessions = sessionsFor(date);
          const isToday     = isSameDay(date, today);
          const isSelected  = selected && isSameDay(selected.date, date);
          const isPast      = isBeforeToday(date);
          const count       = daySessions.length;

          return (
            <div
              key={date.toISOString()}
              className={[
                "sc-cell",
                isToday    ? "today"    : "",
                isSelected ? "selected" : "",
                isPast     ? "past"     : "",
                count > 0  ? "has-sessions" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => handleDayClick(date)}
            >
              <span className="sc-day-num">{date.getDate()}</span>

              {count > 0 && (
                <div className="sc-indicators">
                  {count <= 3
                    ? Array.from({ length: count }).map((_, idx) => (
                        <span key={idx} className="sc-dot" />
                      ))
                    : <span className="sc-count-pill">{count}</span>
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="sc-legend">
        <div className="sc-legend-item">
          <span className="sc-legend-dot today-dot" />
          <span>Today</span>
        </div>
        <div className="sc-legend-item">
          <span className="sc-legend-dot session-dot" />
          <span>Has sessions</span>
        </div>
        <div className="sc-legend-item">
          <span className="sc-legend-dot selected-dot" />
          <span>Selected</span>
        </div>
      </div>

      {/* ── Day Detail Panel ── */}
      {selected && (
        <div className="sc-panel">
          <div className="sc-panel-header">
            <div className="sc-panel-date-wrap">
              <div className="sc-panel-date-num">{selected.date.getDate()}</div>
              <div>
                <div className="sc-panel-weekday">
                  {selected.date.toLocaleString("en-US", { weekday: "long" })}
                </div>
                <div className="sc-panel-fulldate">
                  {selected.date.toLocaleString("en-US", { month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
            <button className="sc-panel-close" onClick={() => setSelected(null)}>✕</button>
          </div>

          {selected.sessions.length === 0 ? (
            <div className="sc-panel-empty">
              <span>📭</span>
              <p>No sessions on this day</p>
            </div>
          ) : (
            <div className="sc-panel-list">
              {selected.sessions.map(s => {
                const isPastSession = new Date(s.sessionDate) < new Date();
                return (
                  <div key={s.id} className={`sc-panel-item${isPastSession ? " past" : ""}`}>
                    <div className="sc-panel-time-col">
                      <div className="sc-panel-time">{fmtTime(s.sessionDate)}</div>
                      <div className={`sc-panel-status${isPastSession ? " done" : " upcoming"}`}>
                        {isPastSession ? "Done" : "Upcoming"}
                      </div>
                    </div>
                    <div className="sc-panel-content">
                      <div className="sc-panel-title">{s.title}</div>
                      {s.description && (
                        <div className="sc-panel-desc">{s.description}</div>
                      )}
                      <div className="sc-panel-meta">
                        <div className="sc-panel-avatar">{s.createdByName?.[0]?.toUpperCase()}</div>
                        {s.createdByName}
                      </div>
                    </div>
                    {canDelete && canDelete(s) && (
                      <button
                        className="sc-panel-del"
                        onClick={() => { onDelete && onDelete(s.id); setSelected(null); }}
                        title="Delete"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
