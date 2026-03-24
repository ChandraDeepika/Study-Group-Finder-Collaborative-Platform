export default function MessageBubble({ msg, isMe, darkMode }) {
  const renderFile = () => {
    if (!msg.fileUrl) return null;
    const url = msg.fileUrl;
    const name = msg.fileName || "file";
    const ext = name.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="mb-file-img-wrap">
          <img src={url} alt={name} className="mb-file-img" />
        </a>
      );
    }
    if (["mp4", "webm", "mov"].includes(ext)) {
      return (
        <video controls className="mb-file-video">
          <source src={url} />
        </video>
      );
    }
    if (["mp3", "wav", "ogg", "m4a"].includes(ext)) {
      return (
        <audio controls className="mb-file-audio">
          <source src={url} />
        </audio>
      );
    }
    if (ext === "pdf") {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="mb-file-doc">
          <span className="mb-file-icon">📄</span>
          <span className="mb-file-name">{name}</span>
        </a>
      );
    }
    if (["doc", "docx"].includes(ext)) {
      return (
        <a href={url} target="_blank" rel="noreferrer" className="mb-file-doc">
          <span className="mb-file-icon">📝</span>
          <span className="mb-file-name">{name}</span>
        </a>
      );
    }
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mb-file-doc">
        <span className="mb-file-icon">📎</span>
        <span className="mb-file-name">{name}</span>
      </a>
    );
  };

  return (
    <div className={`mb-row ${isMe ? "me" : "other"}`}>
      {!isMe && (
        <div className="mb-avatar">
          {msg.sender?.charAt(0).toUpperCase()}
        </div>
      )}
      <div className={`mb-bubble ${isMe ? "me" : "other"} ${darkMode ? "dark" : ""}`}>
        {!isMe && <div className="mb-sender">{msg.sender}</div>}
        {msg.text && <div className="mb-text">{msg.text}</div>}
        {renderFile()}
        <div className="mb-time">{msg.time}</div>
      </div>
    </div>
  );
}
