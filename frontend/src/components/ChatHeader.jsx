import { useNavigate } from "react-router-dom";

export default function ChatHeader({ group, darkMode, onToggleDark, membersCount }) {
  const navigate = useNavigate();

  return (
    <div className={`ch-header ${darkMode ? "dark" : ""}`}>
      <div className="ch-left">
        <div className="ch-avatar">
          {group?.name?.charAt(0).toUpperCase() || "G"}
        </div>
        <div className="ch-info">
          <div className="ch-name">{group?.name || "Study Group"}</div>
          <div className="ch-status">
            <span className="ch-online-dot" />
            <span className="ch-status-text">
              {membersCount > 0 ? `${membersCount} members` : "Active now"}
            </span>
          </div>
        </div>
      </div>

      <div className="ch-actions">
        <button
          className="ch-action-btn"
          title="Voice Call (coming soon)"
          onClick={() => alert("Voice call feature coming soon!")}
        >
          📞
        </button>
        <button
          className="ch-action-btn"
          title="Video Call (coming soon)"
          onClick={() => alert("Video call feature coming soon!")}
        >
          📹
        </button>
        <button
          className="ch-action-btn"
          title="Group Info"
          onClick={() => navigate(`/groups/${group?.id}`)}
        >
          ℹ️
        </button>
        <button
          className="ch-action-btn ch-dark-toggle"
          title={darkMode ? "Light Mode" : "Dark Mode"}
          onClick={onToggleDark}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
}
