import React from 'react';
import '../styles/MessageItem.css';

const MessageItem = ({ message, isSentByMe }) => {
  return (
    <div className={`message-item ${isSentByMe ? 'message-sent' : 'message-received'}`}>
      {!isSentByMe && <span className="message-sender">{message.sender}</span>}
      <div className="message-content">
        <p className="message-text">{message.text}</p>
        <span className="message-time">{message.time}</span>
      </div>
    </div>
  );
};

export default MessageItem;
