import { useRef } from "react";

export default function MessageInput({ value, onChange, onSend, onFileSelect, darkMode }) {
  const fileRef = useRef();

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e);
    }
  };

  return (
    <div className={`mi-wrap ${darkMode ? "dark" : ""}`}>
      <button
        type="button"
        className="mi-attach-btn"
        title="Attach file"
        onClick={() => fileRef.current.click()}
      >
        📎
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={e => onFileSelect(e.target.files[0])}
      />
      <textarea
        className="mi-input"
        placeholder="Type a message... (Enter to send)"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
      />
      <button
        type="button"
        className="mi-send-btn"
        onClick={onSend}
        disabled={!value.trim()}
      >
        ➤
      </button>
    </div>
  );
}
