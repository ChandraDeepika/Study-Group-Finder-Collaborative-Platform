import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/ChatPage.css';
import MessageItem from '../components/MessageItem';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import api from '../services/api';

const EMOJIS = [
  '😀','😂','😍','🥰','😎','😭','😅','🤔','😴','🥳',
  '👍','👎','❤️','🔥','🎉','✅','💯','🙏','👏','🤝',
  '😡','😱','🤣','😇','🥺','😏','🤩','😬','🙄','😤',
  '🍕','🎮','📚','💻','🎵','⚽','🏆','🌟','💡','🚀',
];

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages]             = useState([]);
  const [newMessage, setNewMessage]         = useState('');
  const [connected, setConnected]           = useState(false);
  const [groupName, setGroupName]           = useState('Group Chat');
  const [loading, setLoading]               = useState(true);
  const [showEmoji, setShowEmoji]           = useState(false);
  const [replyTo, setReplyTo]               = useState(null);
  const [typingUsers, setTypingUsers]       = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');
  const [showSearch, setShowSearch]         = useState(false);
  const [memberCount, setMemberCount]       = useState(0);
  const [members, setMembers]               = useState([]);
  const [showMembers, setShowMembers]       = useState(false);

  const messagesEndRef  = useRef(null);
  const stompClientRef  = useRef(null);
  const fileInputRef    = useRef(null);
  const inputRef        = useRef(null);
  const typingTimer     = useRef(null);
  const sentMsgIds      = useRef(new Set()); // track IDs we already added optimistically

  const currentUser      = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserEmail = currentUser.email || '';
  const currentUserName  = currentUser.name  || '';

  // ─── Init ────────────────────────────────────────────────
  useEffect(() => {
    loadHistory();
    connectWebSocket();
    return () => {
      if (stompClientRef.current) stompClientRef.current.deactivate();
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.emoji-panel') && !e.target.closest('.emoji-btn'))
        setShowEmoji(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Load history ────────────────────────────────────────
  const loadHistory = async () => {
    try {
      const [groupRes, chatRes, membersRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/chat`),
        api.get(`/groups/${groupId}/members`),
      ]);
      setGroupName(groupRes.data.name);
      const approved = membersRes.data.filter(m => m.status === 'APPROVED');
      setMemberCount(approved.length);
      setMembers(approved);
      setMessages(chatRes.data.map(normalizeMessage));
      // Mark messages as read in DB
      api.put(`/groups/${groupId}/chat/read`).catch(() => {});
      // Broadcast READ after WS is ready (slight delay to ensure connection)
      setTimeout(() => {
        if (stompClientRef.current?.connected) {
          stompClientRef.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify({
              type: 'READ', groupId: Number(groupId),
              readerEmail: currentUserEmail,
            }),
          });
        }
      }, 1000);
    } catch (err) {
      console.error('Failed to load chat history', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Normalize any message shape ─────────────────────────
  const normalizeMessage = (msg) => {
    const senderEmail = msg.senderEmail
      || (typeof msg.sender === 'object' ? msg.sender?.email : '')
      || '';
    const senderName = msg.senderName
      || (typeof msg.sender === 'object' ? msg.sender?.name : '')
      || (typeof msg.sender === 'string'  ? msg.sender       : '')
      || 'Unknown';
    const rawTime = msg.sentAt || msg.timestamp;
    return {
      id:          msg.id,
      sender:      senderName,
      senderEmail,
      avatar:      msg.senderProfileImage || msg.sender?.profileImage || null,
      text:        msg.content || msg.messageText || '',
      time:        rawTime
                     ? new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                     : '',
      fullTime:    rawTime
                     ? new Date(rawTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                     : '',
      groupId:     msg.groupId || msg.group?.id,
      messageType: (msg.messageType || 'TEXT').toString().toUpperCase(),
      fileUrl:     msg.fileUrl || null,
      edited:      msg.edited || false,
      deleted:     msg.deleted || false,
      status:      msg.status || 'sent',
      reactions:   msg.reactions || {},
    };
  };

  // ─── WebSocket ───────────────────────────────────────────
  const connectWebSocket = () => {
    const token  = localStorage.getItem('token');
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders:   { Authorization: `Bearer ${token}` },
      reconnectDelay:   5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/group', (frame) => {
          const received = JSON.parse(frame.body);
          const msgGroupId = received.groupId || received.group?.id;
          if (String(msgGroupId) !== String(groupId)) return;

          if (received.type === 'TYPING') {
            handleTypingEvent(received);
            return;
          }

          // READ broadcast — update all my sent messages to 'read'
          if (received.type === 'READ') {
            if ((received.readerEmail || '') !== currentUserEmail) {
              setMessages(prev => prev.map(m =>
                m.senderEmail === currentUserEmail ? { ...m, status: 'read' } : m
              ));
            }
            return;
          }

          // DELETE broadcast — update locally for all users
          if (received.type === 'DELETE') {
            setMessages(prev => prev.map(m =>
              String(m.id) === String(received.messageId)
                ? { ...m, deleted: true, text: '[This message was deleted]' }
                : m
            ));
            return;
          }

          const fromMe = (received.senderEmail || '') === currentUserEmail;
          if (fromMe) {
            // We already added this message optimistically — just update status
            const rid = received.id;
            if (rid && sentMsgIds.current.has(rid)) return; // already confirmed, skip
            setMessages(prev => {
              const tmpIdx = prev.findIndex(m => String(m.id).startsWith('tmp-'));
              if (tmpIdx !== -1) {
                const updated = [...prev];
                updated[tmpIdx] = normalizeMessage(received);
                if (rid) sentMsgIds.current.add(rid);
                return updated;
              }
              // No tmp found — check if real id already exists (duplicate guard)
              if (rid && prev.some(m => String(m.id) === String(rid))) return prev;
              if (rid) sentMsgIds.current.add(rid);
              return [...prev, normalizeMessage(received)];
            });
            return;
          }
          // For others: deduplicate by id
          setMessages(prev => {
            const rid = received.id;
            if (rid && prev.some(m => String(m.id) === String(rid))) return prev;
            return [...prev, normalizeMessage(received)];
          });
        });
      },
      onDisconnect:  () => setConnected(false),
      onStompError:  (f) => console.error('STOMP error:', f),
    });
    client.activate();
    stompClientRef.current = client;
  };

  const handleTypingEvent = (event) => {
    if (event.senderEmail === currentUserEmail) return;
    setTypingUsers(prev => {
      const filtered = prev.filter(u => u !== event.senderName);
      return event.isTyping ? [...filtered, event.senderName] : filtered;
    });
    setTimeout(() => {
      setTypingUsers(prev => prev.filter(u => u !== event.senderName));
    }, 3000);
  };

  // ─── Typing indicator ────────────────────────────────────
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          type: 'TYPING', groupId: Number(groupId),
          senderName: currentUserName, senderEmail: currentUserEmail, isTyping: true,
        }),
      });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        stompClientRef.current?.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify({
            type: 'TYPING', groupId: Number(groupId),
            senderName: currentUserName, senderEmail: currentUserEmail, isTyping: false,
          }),
        });
      }, 2000);
    }
  };

  // ─── Delete message ──────────────────────────────────────
  const handleDeleteMessage = async (msgId) => {
    // Optimistic tmp messages — just remove
    if (String(msgId).startsWith('tmp-')) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      return;
    }
    try {
      await api.delete(`/groups/${groupId}/chat/${msgId}`);
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, deleted: true, text: '[This message was deleted]' } : m
      ));
      // Broadcast delete so other users see it immediately
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify({
            type: 'DELETE', groupId: Number(groupId),
            messageId: msgId, senderEmail: currentUserEmail,
          }),
        });
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // ─── Send text message ───────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text) return;
    const capturedReplyTo = replyTo;
    setNewMessage('');
    setReplyTo(null);
    setShowEmoji(false);

    const tmpId = `tmp-${Date.now()}`;
    const optimistic = {
      id: tmpId, sender: currentUserName,
      senderEmail: currentUserEmail, text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      messageType: 'TEXT', fileUrl: null, reactions: {}, status: 'sent',
      replyTo: capturedReplyTo ? { sender: capturedReplyTo.sender, text: capturedReplyTo.text } : null,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await api.post(`/groups/${groupId}/chat`, {
        content: text, messageType: 'TEXT', fileUrl: null,
      });
      const saved = res.data;
      // Update optimistic with real id for sender
      setMessages(prev => prev.map(m =>
        m.id === tmpId ? { ...m, id: saved.id, status: saved.status || 'sent' } : m
      ));
      if (saved.id) sentMsgIds.current.add(saved.id);
      // Broadcast to others via WebSocket
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify({
            id: saved.id,
            groupId: Number(groupId), senderId: currentUser.id,
            senderName: currentUserName, senderEmail: currentUserEmail,
            messageText: text, content: text, messageType: 'TEXT',
            status: saved.status || 'sent',
            timestamp: saved.sentAt || new Date().toISOString(),
          }),
        });
      }
    } catch (err) {
      console.error('Send failed:', err);
      setMessages(prev => prev.filter(m => m.id !== tmpId));
    }
  };

  // ─── File / Image upload ─────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so same file can be re-selected
    e.target.value = '';

    if (file.size > 10 * 1024 * 1024) { alert('File too large. Max 10MB.'); return; }

    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    // Optimistic placeholder
    const tmpId = `tmp-${Date.now()}`;
    const isImage = file.type.startsWith('image/');
    const optimisticMsg = {
      id: tmpId,
      sender: currentUserName, senderEmail: currentUserEmail,
      text: file.name,
      fileUrl: isImage ? URL.createObjectURL(file) : null,
      messageType: isImage ? 'IMAGE' : 'FILE',
      status: 'sent',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullTime: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      reactions: {},
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`/groups/${groupId}/chat/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => setUploadProgress(Math.round((p.loaded * 100) / p.total)),
      });
      const data = res.data;
      const fileUrl    = data.fileUrl    || data.url      || null;
      const fileName   = data.fileName   || data.name     || file.name;
      const msgType    = (data.messageType || (isImage ? 'IMAGE' : 'FILE')).toString().toUpperCase();
      const messageId  = data.messageId  || data.id       || null;

      // Replace optimistic with real message
      setMessages(prev => prev.map(m =>
        m.id === tmpId
          ? { ...m, id: messageId ? Number(messageId) : tmpId, text: fileName, fileUrl, messageType: msgType }
          : m
      ));
      if (messageId) sentMsgIds.current.add(Number(messageId));

      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify({
            id: messageId ? Number(messageId) : null,
            groupId: Number(groupId), senderId: currentUser.id,
            senderName: currentUserName, senderEmail: currentUserEmail,
            messageText: fileName, content: fileName,
            messageType: msgType, fileUrl, status: 'sent',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      // Remove optimistic on failure
      setMessages(prev => prev.filter(m => m.id !== tmpId));
      alert('Upload failed. Please try again.');
    } finally {
      setUploadProgress(null);
    }
  };

  // ─── Emoji ───────────────────────────────────────────────
  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // ─── Reaction ────────────────────────────────────────────
  const addReaction = (msgId, emoji) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      const reactions = { ...m.reactions };
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      return { ...m, reactions };
    }));
  };

  // ─── Search filter ───────────────────────────────────────
  const filteredMessages = searchQuery
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  // ─── Avatar helper ───────────────────────────────────────
  const getAvatar = (msg) => {
    if (msg.avatar) return <img src={`http://localhost:8080/uploads/${msg.avatar}`} alt="" className="avatar-img" />;
    return <div className="avatar-fallback">{(msg.sender || '?')[0].toUpperCase()}</div>;
  };

  // ─── Date separator ──────────────────────────────────────
  const renderMessages = () => {
    let lastDate = '';
    return filteredMessages.map((msg, index) => {
      const isMe = !!currentUserEmail && msg.senderEmail === currentUserEmail;
      const msgDate = msg.fullTime ? msg.fullTime.split(',')[0] : '';
      const showDate = msgDate && msgDate !== lastDate;
      if (showDate) lastDate = msgDate;
      return (
        <React.Fragment key={msg.id || index}>
          {showDate && <div className="date-separator"><span>{msgDate}</span></div>}
          <MessageItem
            message={msg}
            isSentByMe={isMe}
            onReply={() => setReplyTo(msg)}
            onReact={(emoji) => addReaction(msg.id, emoji)}
            onDelete={handleDeleteMessage}
            getAvatar={getAvatar}
          />
        </React.Fragment>
      );
    });
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <Layout>
      <div className="chat-page-wrapper">

        {/* ── Header ── */}
        <div className="chat-topbar">
          <button className="chat-back-btn" onClick={() => navigate(`/groups/${groupId}`)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>

          <div className="chat-topbar-info">
            <div className="chat-topbar-avatar">{groupName[0]?.toUpperCase()}</div>
            <div>
              <div className="chat-topbar-name">{groupName}</div>
              <div className="chat-topbar-meta">
                {memberCount > 0 && <span>{memberCount} members · </span>}
                <span className={connected ? 'status-live' : 'status-connecting'}>
                  {connected ? '● Live' : '○ Connecting...'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-topbar-actions">
            <button className="icon-btn" title="Search" onClick={() => setShowSearch(s => !s)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button
              className={`icon-btn ${showMembers ? 'icon-btn-active' : ''}`}
              title="Members"
              onClick={() => setShowMembers(s => !s)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Search bar ── */}
        {showSearch && (
          <div className="chat-search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              autoFocus
              placeholder="Search messages..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && <button onClick={() => setSearchQuery('')}>✕</button>}
          </div>
        )}

        {/* ── Body: messages + optional members panel ── */}
        <div className="chat-body">

          {/* ── Messages area ── */}
          <div className="chat-messages-area">
            {loading ? (
              <div className="chat-center-state">
                <div className="chat-spinner" />
                <p>Loading messages...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="chat-center-state">
                <div className="chat-empty-icon">💬</div>
                <p>{searchQuery ? 'No messages match your search.' : 'No messages yet. Say hello! 👋'}</p>
              </div>
            ) : (
              renderMessages()
            )}

            {uploadProgress !== null && (
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                <span>Uploading... {uploadProgress}%</span>
              </div>
            )}

            {typingUsers.length > 0 && (
              <div className="typing-indicator">
                <span className="typing-dots"><span/><span/><span/></span>
                <span className="typing-text">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Members side panel ── */}
          {showMembers && (
            <div className="members-panel">
              <div className="members-panel-header">
                <span>Members ({memberCount})</span>
                <button className="members-panel-close" onClick={() => setShowMembers(false)}>✕</button>
              </div>
              <div className="members-panel-list">
                {members.map(m => (
                  <div key={m.userId} className="member-item">
                    <div className="member-avatar">
                      {m.profileImage
                        ? <img src={`http://localhost:8080/uploads/${m.profileImage}`} alt="" />
                        : <span>{(m.userName || '?')[0].toUpperCase()}</span>
                      }
                    </div>
                    <div className="member-info">
                      <span className="member-name">{m.userName}</span>
                      <span className="member-role">{m.role === 'ADMIN' ? '👑 Admin' : 'Member'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Reply preview ── */}
        {replyTo && (
          <div className="reply-preview">
            <div className="reply-preview-content">
              <span className="reply-preview-sender">{replyTo.sender}</span>
              <span className="reply-preview-text">{replyTo.text?.slice(0, 80)}</span>
            </div>
            <button className="reply-close-btn" onClick={() => setReplyTo(null)}>✕</button>
          </div>
        )}

        {/* ── Emoji panel ── */}
        {showEmoji && (
          <div className="emoji-panel">
            {EMOJIS.map(e => (
              <button key={e} className="emoji-item" onClick={() => insertEmoji(e)}>{e}</button>
            ))}
          </div>
        )}

        {/* ── Input area ── */}
        <div className="chat-input-area">
          <button
            type="button"
            className="icon-btn emoji-btn"
            title="Emoji"
            onClick={() => setShowEmoji(s => !s)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>

          <button
            type="button"
            className="icon-btn attach-btn"
            title="Attach file or image"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
            onChange={handleFileUpload}
          />

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={connected ? 'Type a message...' : 'Connecting...'}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
              }}
              autoComplete="off"
            />
            <button
              type="submit"
              className={`send-btn ${newMessage.trim() ? 'send-btn-active' : ''}`}
              disabled={!newMessage.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z"/>
              </svg>
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
};

export default ChatPage;
