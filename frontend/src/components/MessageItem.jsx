import React, { useState } from 'react';
import '../styles/MessageItem.css';

const QUICK_REACTIONS = ['👍','❤️','😂','😮','😢','🔥'];

const MessageItem = ({ message, isSentByMe, onReply, onReact, onDelete, getAvatar }) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const isDeleted  = message.deleted || message.text === '[This message was deleted]';
  const isImage    = message.messageType === 'IMAGE';
  const isFile     = message.messageType === 'FILE';
  const hasReactions = message.reactions && Object.keys(message.reactions).length > 0;

  const getFileIcon = (fileName) => {
    if (!fileName) return '📎';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📋', pptx: '📋', zip: '🗜️', txt: '📃' };
    return icons[ext] || '📎';
  };

  const renderContent = () => {
    if (isDeleted) return <p className="msg-deleted">🚫 This message was deleted</p>;

    if (isImage && message.fileUrl) return (
      <div className="msg-image-wrap">
        <img
          src={message.fileUrl}
          alt="shared"
          className="msg-image"
          onClick={() => window.open(message.fileUrl, '_blank')}
        />
        {message.text && message.text !== message.fileUrl && (
          <p className="msg-caption">{message.text}</p>
        )}
      </div>
    );

    if (isFile && message.fileUrl) return (
      <a href={message.fileUrl} target="_blank" rel="noreferrer" className="msg-file">
        <span className="msg-file-icon">{getFileIcon(message.text)}</span>
        <div className="msg-file-info">
          <span className="msg-file-name">{message.text}</span>
          <span className="msg-file-label">Tap to download</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
    );

    return <p className="msg-text">{message.text}</p>;
  };

  return (
    <div
      className={`msg-row ${isSentByMe ? 'msg-row-me' : 'msg-row-other'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
    >
      {/* Avatar — only for others */}
      {!isSentByMe && (
        <div className="msg-avatar">
          {getAvatar ? getAvatar(message) : (
            <div className="avatar-fallback">{(message.sender || '?')[0].toUpperCase()}</div>
          )}
        </div>
      )}

      <div className={`msg-body ${isSentByMe ? 'msg-body-me' : 'msg-body-other'}`}>

        {/* Sender name — only for others */}
        {!isSentByMe && !isDeleted && (
          <span className="msg-sender-name">{message.sender}</span>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className="msg-reply-preview">
            <span className="msg-reply-sender">{message.replyTo.sender}</span>
            <span className="msg-reply-text">{message.replyTo.text?.slice(0, 60)}</span>
          </div>
        )}

        {/* Bubble */}
        <div className={`msg-bubble ${isSentByMe ? 'bubble-me' : 'bubble-other'} ${isDeleted ? 'bubble-deleted' : ''}`}>
          {renderContent()}
          <div className="msg-meta">
            {message.edited && <span className="msg-edited">edited</span>}
            <span className="msg-time">{message.time}</span>
            {isSentByMe && (
              <span className={`msg-tick ${
                message.status === 'read'    ? 'tick-read' :
                message.status === 'delivered' ? 'tick-delivered' : 'tick-sent'
              }`}>
                {message.status === 'read' ? '✓✓' :
                 message.status === 'delivered' ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>

        {/* Reactions */}
        {hasReactions && (
          <div className="msg-reactions">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <button key={emoji} className="reaction-chip" onClick={() => onReact && onReact(emoji)}>
                {emoji} {count > 1 && <span>{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover action bar */}
      {showActions && !isDeleted && (
        <div className={`msg-actions ${isSentByMe ? 'msg-actions-me' : 'msg-actions-other'}`}>
          <div className="reaction-picker-wrap">
            <button
              className="action-btn"
              title="React"
              onClick={() => setShowReactionPicker(s => !s)}
            >😊</button>
            {showReactionPicker && (
              <div className="quick-reactions">
                {QUICK_REACTIONS.map(e => (
                  <button key={e} onClick={() => { onReact && onReact(e); setShowReactionPicker(false); }}>
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="action-btn" title="Reply" onClick={() => onReply && onReply(message)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
            </svg>
          </button>
          {isSentByMe && onDelete && (
            <button className="action-btn action-btn-delete" title="Delete" onClick={() => onDelete(message.id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
