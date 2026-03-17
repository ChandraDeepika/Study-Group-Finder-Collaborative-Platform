import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import "../styles/ChatPage.css";

const BASE_URL = "http://localhost:8080";

const FILE_TYPES = [
  { label: "Image",      icon: "🖼️", accept: "image/*" },
  { label: "Video",      icon: "🎬", accept: "video/*" },
  { label: "Audio",      icon: "🎵", accept: "audio/*" },
  { label: "PDF",        icon: "📄", accept: "application/pdf,.pdf" },
  { label: "Word",       icon: "📝", accept: ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { label: "PowerPoint", icon: "📊", accept: ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { label: "Excel",      icon: "📈", accept: ".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { label: "Other",      icon: "📎", accept: ".zip,.rar,.txt,.json,.xml" },
];

const FILE_ICONS = { pdf: "📄", ppt: "📊", word: "📝", excel: "📈", txt: "📃", file: "📎" };

const resolveUrl = (url) =>
  url ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : null;

const getFileType = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg","jpeg","png","gif","webp","bmp","svg"].includes(ext)) return "image";
  if (["mp4","webm","mov","avi"].includes(ext))                    return "video";
  if (["mp3","wav","ogg","m4a"].includes(ext))                     return "audio";
  if (ext === "pdf")                                               return "pdf";
  if (["ppt","pptx"].includes(ext))                               return "ppt";
  if (["doc","docx"].includes(ext))                               return "word";
  if (["xls","xlsx","csv"].includes(ext))                         return "excel";
  if (ext === "txt")                                              return "txt";
  return "file";
};

// Types previewable in browser natively
const NATIVE_PREVIEW = ["image", "audio", "pdf", "txt"];
// Types previewable via Google Docs viewer (office formats)
const GDOCS_PREVIEW  = ["ppt", "word", "excel"];
const PREVIEWABLE    = [...NATIVE_PREVIEW, ...GDOCS_PREVIEW];

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const { dark }    = useTheme();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeGroup,  setActiveGroup]  = useState(null);
  const [allGroups,    setAllGroups]    = useState([]);
  const [messages,     setMessages]     = useState([]);
  const [newMessage,   setNewMessage]   = useState("");
  const [othersTyping, setOthersTyping] = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [membersCount, setMembersCount] = useState(0);
  const [editingId,    setEditingId]    = useState(null);
  const [editText,     setEditText]     = useState("");
  const [preview,      setPreview]      = useState(null); // {url, blobUrl, name, type, text}
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const messagesEndRef  = useRef(null);
  const othersTypingRef = useRef(null);
  const fileRef         = useRef();
  const picRef          = useRef();
  const fileMenuRef     = useRef();
  // Track server message IDs only (not optimistic ones)
  const serverMsgIds    = useRef(new Set());
  // Stable list of optimistic messages pending confirmation
  const optimisticMsgs  = useRef([]);

  const groupPicUrl = (g) => resolveUrl(g?.profileImage);

  // ── load groups ──────────────────────────────────────────
  const loadGroups = useCallback(() => {
    api.get("/groups/my-groups").then(res => {
      const list = res.data || [];
      setAllGroups(list);
      if (groupId) {
        const found = list.find(g => String(g.id) === String(groupId));
        setActiveGroup(found || { id: groupId, name: "Study Group" });
      }
    }).catch(console.error);
  }, [groupId]);

  useEffect(() => {
    loadGroups();
    if (groupId) {
      api.get(`/groups/${groupId}/members`)
        .then(res => setMembersCount(res.data?.length || 0))
        .catch(() => setMembersCount(0));
    }
  }, [groupId, loadGroups]);

  // ── fetch & merge messages ───────────────────────────────
  // Key fix: always load from server, merge with pending optimistic msgs
  const fetchMessages = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await api.get(`/groups/${groupId}/chat`);
      const serverMsgs = res.data.map(msg => ({
        id:          msg.id,
        sender:      msg.senderName || "User",
        senderEmail: msg.senderEmail || "",
        text:        msg.content || "",
        fileUrl:     resolveUrl(msg.fileUrl),
        // fileName: backend stores original filename in content for file messages
        fileName:    msg.fileUrl ? (msg.content || null) : null,
        time:        new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read:        true,
        optimistic:  false,
      }));

      // detect new messages from others → typing indicator
      const newIds = serverMsgs.filter(m => !serverMsgIds.current.has(String(m.id)));
      newIds.forEach(m => serverMsgIds.current.add(String(m.id)));
      const othersNew = newIds.filter(m => m.senderEmail !== currentUser.email);
      if (othersNew.length > 0) {
        setOthersTyping(true);
        clearTimeout(othersTypingRef.current);
        othersTypingRef.current = setTimeout(() => setOthersTyping(false), 2000);
      }

      // Remove confirmed optimistic messages (those whose server ID now exists)
      optimisticMsgs.current = optimisticMsgs.current.filter(
        o => !serverMsgs.some(s => String(s.id) === String(o.confirmedId))
      );

      // Append any still-pending optimistic msgs at the end
      setMessages([...serverMsgs, ...optimisticMsgs.current]);
    } catch (err) { console.error("Error loading messages:", err); }
  }, [groupId, currentUser.email]);

  // Reset on group change — this also fixes "messages gone after re-login"
  // because serverMsgIds is reset so all messages reload fresh from server
  useEffect(() => {
    serverMsgIds.current   = new Set();
    optimisticMsgs.current = [];
    setMessages([]);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target))
        setShowFileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── send text ────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage("");
    try {
      const res = await api.post(`/groups/${groupId}/chat`, {
        content: text, messageType: "TEXT", fileUrl: null,
      });
      // Server will return it on next poll; just add to serverMsgIds to avoid duplicate
      if (res.data?.id) serverMsgIds.current.add(String(res.data.id));
      fetchMessages();
    } catch (err) { console.error("Send failed:", err); setNewMessage(text); }
  };

  // ── file upload ──────────────────────────────────────────
  const handleFileSelect = async (file) => {
    if (!file) return;
    setShowFileMenu(false);
    const optimisticId = `opt-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    const optimisticMsg = {
      id: optimisticId, sender: currentUser.name || "You",
      senderEmail: currentUser.email || "", text: "",
      fileUrl: localUrl, fileName: file.name,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false, optimistic: true, confirmedId: null,
    };
    optimisticMsgs.current = [...optimisticMsgs.current, optimisticMsg];
    setMessages(prev => [...prev, optimisticMsg]);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/groups/${groupId}/chat/upload`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data;
      const confirmedId = d.messageId || d.id;
      // Mark optimistic as confirmed so next poll removes it (use String for safe comparison)
      optimisticMsgs.current = optimisticMsgs.current.map(o =>
        o.id === optimisticId ? { ...o, confirmedId: String(confirmedId) } : o
      );
      if (confirmedId) serverMsgIds.current.add(String(confirmedId));
      // Immediately fetch so the real message replaces optimistic
      await fetchMessages();
    } catch (err) {
      console.error("Upload failed:", err);
      optimisticMsgs.current = optimisticMsgs.current.filter(o => o.id !== optimisticId);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    } finally { setUploading(false); }
  };

  const openFilePicker = (accept) => { fileRef.current.accept = accept; fileRef.current.click(); };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file") { e.preventDefault(); handleFileSelect(item.getAsFile()); return; }
    }
  };

  // ── edit ─────────────────────────────────────────────────
  const startEdit  = (msg) => { setEditingId(msg.id); setEditText(msg.text); };
  const saveEdit   = async () => {
    if (!editText.trim()) return;
    setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text: editText } : m));
    setEditingId(null); setEditText("");
  };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  // ── blob fetch ───────────────────────────────────────────
  const fetchBlob = async (url) => {
    const token = localStorage.getItem("token");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("fetch failed");
    return res.blob();
  };

  // ── download ─────────────────────────────────────────────
  const handleDownload = async (url, name) => {
    try {
      const blob = await fetchBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = name || "file";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, "_blank"); }
  };

  // ── open preview ─────────────────────────────────────────
  const openPreview = async (url, name, type) => {
    // Office formats: use Google Docs viewer with the public URL
    if (GDOCS_PREVIEW.includes(type)) {
      setPreview({ url, blobUrl: null, name, type, text: null, gdocsUrl: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true` });
      return;
    }
    setPreviewLoading(true);
    setPreview({ url, blobUrl: null, name, type, text: null, gdocsUrl: null });
    try {
      const blob = await fetchBlob(url);
      if (type === "txt") {
        const text = await blob.text();
        setPreview({ url, blobUrl: null, name, type, text, gdocsUrl: null });
      } else {
        const blobUrl = URL.createObjectURL(blob);
        setPreview({ url, blobUrl, name, type, text: null, gdocsUrl: null });
      }
    } catch {
      setPreview({ url, blobUrl: url, name, type, text: null, gdocsUrl: null });
    } finally { setPreviewLoading(false); }
  };

  // ── group pic upload ─────────────────────────────────────
  const handleGroupPicUpload = async (file, gId) => {
    if (!file) return;
    setUploadingPic(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post(`/groups/${gId}/profile-image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const newPic = res.data.profileImage;
      setAllGroups(prev => prev.map(g => String(g.id) === String(gId) ? { ...g, profileImage: newPic } : g));
      if (String(gId) === String(groupId))
        setActiveGroup(prev => ({ ...prev, profileImage: newPic }));
    } catch (err) { console.error("Pic upload failed:", err); }
    finally { setUploadingPic(false); }
  };

  // ── render file in bubble ────────────────────────────────
  const renderFilePreview = (msg) => {
    if (!msg.fileUrl) return null;
    const type = getFileType(msg.fileName || "");
    const canPreview = PREVIEWABLE.includes(type);

    if (type === "image") return (
      <div className="cp-img-wrap">
        <img src={msg.fileUrl} alt={msg.fileName} className="cp-msg-img"
          onClick={() => openPreview(msg.fileUrl, msg.fileName, type)}
          onError={e => { e.target.style.display = "none"; }} />
        <button className="cp-img-dl" onClick={() => handleDownload(msg.fileUrl, msg.fileName)} title="Download">⬇</button>
      </div>
    );
    if (type === "video") return (
      <div className="cp-video-wrap">
        <VideoBlobPlayer url={msg.fileUrl} />
        <button className="cp-file-dl-btn" onClick={() => handleDownload(msg.fileUrl, msg.fileName)}>⬇ Download</button>
      </div>
    );
    if (type === "audio") return (
      <div className="cp-audio-wrap">
        <audio controls src={msg.fileUrl} className="cp-msg-audio" />
        <button className="cp-file-dl-btn" onClick={() => handleDownload(msg.fileUrl, msg.fileName)}>⬇ Download</button>
      </div>
    );
    // All document types — show card with preview button if previewable
    return (
      <div className="cp-msg-file">
        <span className="cp-msg-file-icon">{FILE_ICONS[type] || "📎"}</span>
        <div className="cp-msg-file-info">
          <span className="cp-msg-file-name">{msg.fileName}</span>
          <span className="cp-msg-file-type">{type.toUpperCase()}</span>
        </div>
        <div className="cp-msg-file-actions">
          {canPreview && (
            <button className="cp-file-action-btn" title="Preview"
              onClick={() => openPreview(msg.fileUrl, msg.fileName, type)}>👁</button>
          )}
          <button className="cp-file-action-btn" title="Download"
            onClick={() => handleDownload(msg.fileUrl, msg.fileName)}>⬇</button>
        </div>
      </div>
    );
  };

  // Video needs blob src because <video> can't send auth headers
  const VideoBlobPlayer = ({ url }) => {
    const [blobSrc, setBlobSrc] = useState(null);
    useEffect(() => {
      let objectUrl;
      // only fetch from server URLs, not local blob: URLs
      if (url && !url.startsWith("blob:")) {
        fetchBlob(url).then(blob => {
          objectUrl = URL.createObjectURL(blob);
          setBlobSrc(objectUrl);
        }).catch(() => setBlobSrc(url));
      } else {
        setBlobSrc(url);
      }
      return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [url]);
    if (!blobSrc) return <div className="cp-video-loading">Loading video…</div>;
    return <video controls src={blobSrc} className="cp-msg-video" />;
  };

  const ReadTick = ({ read }) => (
    <span className={`cp-tick ${read ? "read" : ""}`}>✓✓</span>
  );

  if (!groupId) {
    return (
      <Layout>
        <div className="cp-no-group">
          <div className="cp-no-group-icon">💬</div>
          <h2>No group selected</h2>
          <p>Go to Groups and open a chat</p>
          <button onClick={() => navigate("/groups")}>Browse Groups</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cp-shell-wrap">

        {/* ── GROUPS SIDEBAR ──────────────────────────────── */}
        <div className="cp-groups-sidebar">
          <div className="cp-gs-header">
            <span className="cp-gs-header-icon">💬</span>
            <span className="cp-gs-header-title">My Groups</span>
            <span className="cp-gs-count">{allGroups.length}</span>
          </div>
          <div className="cp-gs-list">
            {allGroups.length === 0 && (
              <div className="cp-gs-empty"><span>🏫</span><p>No groups yet</p></div>
            )}
            {allGroups.map(g => {
              const isActive = String(g.id) === String(groupId);
              const isAdmin  = g.role === "ADMIN";
              const pic      = groupPicUrl(g);
              return (
                <div key={g.id}
                  className={`cp-gs-item ${isActive ? "active" : ""}`}
                  onClick={() => navigate(`/groups/${g.id}/chat`)}
                >
                  <div className="cp-gs-avatar-wrap">
                    {pic
                      ? <img src={pic} alt={g.name} className="cp-gs-avatar-img" />
                      : <div className="cp-gs-avatar">{g.name?.[0]?.toUpperCase()}</div>
                    }
                    {isAdmin && (
                      <>
                        <input ref={isActive ? picRef : null} type="file" accept="image/*"
                          style={{ display: "none" }}
                          onChange={e => { handleGroupPicUpload(e.target.files[0], g.id); e.target.value = ""; }} />
                        <button className="cp-gs-pic-btn" title="Change group photo"
                          onClick={e => { e.stopPropagation(); picRef.current?.click(); }}
                          disabled={uploadingPic}>
                          {uploadingPic && isActive ? "⏳" : "📷"}
                        </button>
                      </>
                    )}
                  </div>
                  <div className="cp-gs-info">
                    <div className="cp-gs-name">{g.name}</div>
                    <div className="cp-gs-meta">
                      <span className={`cp-gs-badge ${g.privacy === "PRIVATE" ? "priv" : "pub"}`}>
                        {g.privacy === "PRIVATE" ? "🔒 Private" : "🌐 Public"}
                      </span>
                      {g.courseName && <span className="cp-gs-course">{g.courseName}</span>}
                    </div>
                    {isAdmin && <span className="cp-gs-role">Admin</span>}
                  </div>
                  {isActive && <span className="cp-gs-active-indicator" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="cp-shell">

          {/* ── HEADER ──────────────────────────────────────── */}
          <div className="cp-header">
            <div className="cp-header-left">
              <button className="cp-back-btn" onClick={() => navigate(`/groups/${groupId}`)}>←</button>
              <div className="cp-header-avatar">
                {groupPicUrl(activeGroup)
                  ? <img src={groupPicUrl(activeGroup)} alt={activeGroup?.name}
                      style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"10px" }} />
                  : activeGroup?.name?.charAt(0).toUpperCase() || "G"
                }
              </div>
              <div className="cp-header-info">
                <div className="cp-header-name">{activeGroup?.name || "Study Group"}</div>
                <div className="cp-header-status">
                  <span className="cp-online-dot" />
                  <span>{membersCount > 0 ? `${membersCount} members` : "Active"}</span>
                </div>
              </div>
            </div>
            <div className="cp-header-actions">
              <button className="cp-action-btn" title="Voice Call" onClick={() => alert("Voice call coming soon!")}>📞</button>
              <button className="cp-action-btn" title="Video Call" onClick={() => alert("Video call coming soon!")}>📹</button>
              <button className="cp-action-btn" title="Group Info" onClick={() => navigate(`/groups/${groupId}`)}>ℹ️</button>
            </div>
          </div>

          {/* ── MESSAGES ────────────────────────────────────── */}
          <div className="cp-messages">
            {messages.length === 0 && (
              <div className="cp-empty"><span>🎉</span><p>No messages yet — say hello!</p></div>
            )}
            {messages.map(msg => {
              const isMe = msg.senderEmail === currentUser.email;
              return (
                <div key={msg.id} className={`cp-msg-row ${isMe ? "me" : "other"}`}>
                  {!isMe && <div className="cp-msg-avatar">{msg.sender?.charAt(0).toUpperCase()}</div>}
                  <div className={`cp-msg-bubble ${isMe ? "me" : "other"} ${msg.optimistic ? "optimistic" : ""}`}>
                    {!isMe && <div className="cp-msg-sender">{msg.sender}</div>}
                    {editingId === msg.id ? (
                      <div className="cp-edit-wrap">
                        <input className="cp-edit-input" value={editText}
                          onChange={e => setEditText(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
                          autoFocus />
                        <div className="cp-edit-actions">
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {msg.text && <div className="cp-msg-text">{msg.text}</div>}
                        {renderFilePreview(msg)}
                      </>
                    )}
                    <div className="cp-msg-footer">
                      <span className="cp-msg-time">{msg.time}</span>
                      {isMe && editingId !== msg.id && msg.text && !msg.optimistic && (
                        <button className="cp-edit-btn" onClick={() => startEdit(msg)} title="Edit">✏️</button>
                      )}
                      {isMe && <ReadTick read={msg.read} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {uploading && <div className="cp-uploading">Uploading...</div>}
            <div ref={messagesEndRef} />
          </div>

          {othersTyping && (
            <div className="cp-typing">
              <span className="cp-typing-dots"><span /><span /><span /></span>
              Someone is typing
            </div>
          )}

          {/* ── INPUT ───────────────────────────────────────── */}
          <div className="cp-input-wrap">
            <input ref={fileRef} type="file" style={{ display: "none" }}
              onChange={e => { handleFileSelect(e.target.files[0]); e.target.value = ""; }} />

            <div className="cp-file-menu-wrap" ref={fileMenuRef}>
              <button className="cp-attach-btn" title="Share file"
                onClick={() => setShowFileMenu(p => !p)}>📎</button>
              {showFileMenu && (
                <div className="cp-file-menu">
                  {FILE_TYPES.map(ft => (
                    <button key={ft.label} className="cp-file-menu-item"
                      onClick={() => openFilePicker(ft.accept)}>
                      <span className="cp-file-menu-icon">{ft.icon}</span>
                      <span>{ft.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea className="cp-input"
              placeholder="Type a message… (Enter to send)"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1}
            />
            <button className="cp-send-btn" onClick={handleSend} disabled={!newMessage.trim()}>➤</button>
          </div>

          {/* ── FILE PREVIEW MODAL ──────────────────────────── */}
          {preview && (
            <div className="cp-preview-overlay" onClick={() => setPreview(null)}>
              <div className="cp-preview-modal" onClick={e => e.stopPropagation()}>
                <div className="cp-preview-header">
                  <span className="cp-preview-title">{preview.name}</span>
                  <div className="cp-preview-header-actions">
                    <button className="cp-preview-dl-btn"
                      onClick={() => handleDownload(preview.url, preview.name)}>⬇ Download</button>
                    <button className="cp-preview-close" onClick={() => setPreview(null)}>✕</button>
                  </div>
                </div>
                <div className="cp-preview-body">
                  {previewLoading && <div className="cp-preview-loading">Loading preview…</div>}
                  {!previewLoading && preview.type === "image" && <img src={preview.blobUrl} alt={preview.name} />}
                  {!previewLoading && preview.type === "video" && <video controls src={preview.blobUrl} autoPlay style={{maxWidth:"100%",maxHeight:"65vh"}} />}
                  {!previewLoading && preview.type === "audio" && <audio controls src={preview.blobUrl} autoPlay style={{width:"100%"}} />}
                  {!previewLoading && preview.type === "pdf"   && <iframe src={preview.blobUrl} title={preview.name} style={{width:"100%",height:"65vh",border:"none"}} />}
                  {!previewLoading && preview.type === "txt"   && (
                    <pre className="cp-preview-text">{preview.text}</pre>
                  )}
                  {!previewLoading && preview.gdocsUrl && (
                    <iframe src={preview.gdocsUrl} title={preview.name} style={{width:"100%",height:"65vh",border:"none"}} />
                  )}
                  {!previewLoading && !PREVIEWABLE.includes(preview.type) && (
                    <div className="cp-preview-unsupported">
                      <span>{FILE_ICONS[preview.type] || "📎"}</span>
                      <p>{preview.name}</p>
                      <p>This file type cannot be previewed in the browser.</p>
                      <button onClick={() => handleDownload(preview.url, preview.name)}>⬇ Download to open</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
