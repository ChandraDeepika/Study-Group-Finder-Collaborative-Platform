import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";
import { useTheme } from "../context/ThemeContext";
import "../styles/ChatPage.css";

const BASE_URL = "http://localhost:8080";

// ── File type menu (no audio/video) ──────────────────────────
const FILE_TYPES = [
  { label: "Image",       icon: "🖼️",  accept: "image/*" },
  { label: "PDF",         icon: "📄",  accept: ".pdf" },
  { label: "Word",        icon: "📝",  accept: ".doc,.docx" },
  { label: "PowerPoint",  icon: "📊",  accept: ".ppt,.pptx" },
  { label: "Excel / CSV", icon: "📈",  accept: ".xls,.xlsx,.csv" },
  { label: "Other",       icon: "📎",  accept: "" },
];

const FILE_ICONS = { pdf: "📄", ppt: "📊", word: "📝", excel: "📈", csv: "📊", txt: "📃", file: "📎" };

const MIME_TYPES = {
  pdf:   "application/pdf",
  word:  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt:   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv:   "text/csv",
  txt:   "text/plain",
};

const resolveUrl = (url) =>
  url ? (url.startsWith("http") ? url : `${BASE_URL}${url}`) : null;

const getFileType = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg","jpeg","png","gif","webp","bmp","svg"].includes(ext)) return "image";
  if (ext === "pdf")                                               return "pdf";
  if (["ppt","pptx"].includes(ext))                               return "ppt";
  if (["doc","docx"].includes(ext))                               return "word";
  if (["xls","xlsx"].includes(ext))                               return "excel";
  if (ext === "csv")                                              return "csv";
  if (ext === "txt")                                              return "txt";
  return "file";
};

// image + pdf + txt + csv can be previewed natively in browser
const NATIVE_PREVIEW = ["image", "pdf", "txt", "csv"];
// office files: show download-only card (browser can't render them)
const OFFICE_TYPES   = ["word", "ppt", "excel"];
const PREVIEWABLE    = [...NATIVE_PREVIEW, ...OFFICE_TYPES];

export default function ChatPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  useTheme();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeGroup,    setActiveGroup]    = useState(null);
  const [allGroups,      setAllGroups]      = useState([]);
  const [messages,       setMessages]       = useState([]);
  const [newMessage,     setNewMessage]     = useState("");
  const [othersTyping,   setOthersTyping]   = useState(false);
  const [uploading,      setUploading]      = useState(false);
  const [membersCount,   setMembersCount]   = useState(0);
  const [editingId,      setEditingId]      = useState(null);
  const [editText,       setEditText]       = useState("");
  const [preview,        setPreview]        = useState(null);
  const [showFileMenu,   setShowFileMenu]   = useState(false);
  const [uploadingPic,   setUploadingPic]   = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const messagesEndRef  = useRef(null);
  const othersTypingRef = useRef(null);
  const fileRef         = useRef();
  const picRef          = useRef();
  const fileMenuRef     = useRef();
  const serverMsgIds    = useRef(new Set());
  const optimisticMsgs  = useRef([]);

  const groupPicUrl = (g) => resolveUrl(g?.profileImage);

  // ── load groups ───────────────────────────────────────────
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

  // ── fetch & merge messages ────────────────────────────────
 const fetchMessages = useCallback(async () => {
  if (!groupId) return;

  try {
    const res = await api.get(`/groups/${groupId}/chat`);

    if (!Array.isArray(res.data)) {
      console.error("Invalid response:", res.data);
      return;
    }

    const serverMsgs = res.data.map(msg => ({
      id: msg.id,
      sender: msg.senderName || "User",
      senderEmail: msg.senderEmail || "",
      text: msg.content || "",
      fileUrl: resolveUrl(msg.fileUrl),
      fileName: msg.fileUrl ? (msg.content || null) : null,
      time: new Date(msg.timestamp || msg.sentAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }),
      read: true,
      optimistic: false,
    }));

    setMessages(serverMsgs);

  } catch (err) {
    console.error("Error loading messages:", err.response?.data || err.message);
  }
}, [groupId, currentUser.email]);
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

  // ── send text ─────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage("");
    try {
      const res = await api.post(`/groups/${groupId}/chat`, {
        content: text.trim(), messageType: "TEXT", fileUrl: null,
      });
      if (res.data?.id) serverMsgIds.current.add(String(res.data.id));
      fetchMessages();
    } catch (err) { console.error("Send failed:", err); setNewMessage(text); }
  };

  // ── file upload ───────────────────────────────────────────
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
      // Do NOT set Content-Type manually — axios sets multipart/form-data + boundary automatically
      const res = await api.post(`/groups/${groupId}/chat/upload`, form);
      const confirmedId = String(res.data.messageId || res.data.id || "");
      optimisticMsgs.current = optimisticMsgs.current.map(o =>
        o.id === optimisticId ? { ...o, confirmedId } : o
      );
      if (confirmedId) serverMsgIds.current.add(confirmedId);
      await fetchMessages();
    } catch (err) {
      console.error("Upload failed:", err);
      optimisticMsgs.current = optimisticMsgs.current.filter(o => o.id !== optimisticId);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    } finally {
      setUploading(false);
    }
  };

  // Defer click to next tick so accept attribute is applied before dialog opens
  const openFilePicker = (accept) => {
    const input = fileRef.current;
    input.value  = "";
    input.accept = accept; // "" means no filter (Other)
    setTimeout(() => input.click(), 0);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file") { e.preventDefault(); handleFileSelect(item.getAsFile()); return; }
    }
  };

  // ── edit ──────────────────────────────────────────────────
  const startEdit  = (msg) => { setEditingId(msg.id); setEditText(msg.text); };
  const saveEdit   = async () => {
    if (!editText.trim()) return;
    setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text: editText } : m));
    setEditingId(null); setEditText("");
  };
  const cancelEdit = () => { setEditingId(null); setEditText(""); };

  // ── blob fetch (auth header) ──────────────────────────────
  const fetchBlob = async (url) => {
    const token = localStorage.getItem("token");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("fetch failed");
    return res.blob();
  };

  // ── download ──────────────────────────────────────────────
  const handleDownload = async (url, name) => {
    try {
      const blob   = await fetchBlob(url);
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl; a.download = name || "file";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch { window.open(url, "_blank"); }
  };

  // ── open preview ──────────────────────────────────────────
  const openPreview = async (url, name, type) => {
    setPreviewLoading(true);
    setPreview({ url, blobUrl: null, name, type, text: null });
    try {
      if (OFFICE_TYPES.includes(type)) {
        // Office files can't be rendered — show download card immediately
        setPreview({ url, blobUrl: null, name, type, text: null });
      } else if (type === "txt" || type === "csv") {
        const blob = await fetchBlob(url);
        const text = await blob.text();
        setPreview({ url, blobUrl: null, name, type, text });
      } else {
        const blob     = await fetchBlob(url);
        const mime     = MIME_TYPES[type] || blob.type || "application/octet-stream";
        const typed    = new Blob([blob], { type: mime });
        const blobUrl  = URL.createObjectURL(typed);
        setPreview({ url, blobUrl, name, type, text: null });
      }
    } catch {
      setPreview({ url, blobUrl: null, name, type, text: null });
    } finally { setPreviewLoading(false); }
  };

  // ── group pic upload ──────────────────────────────────────
  const handleGroupPicUpload = async (file, gId) => {
    if (!file) return;
    setUploadingPic(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res    = await api.post(`/groups/${gId}/profile-image`, form);
      const newPic = res.data.profileImage;
      setAllGroups(prev => prev.map(g => String(g.id) === String(gId) ? { ...g, profileImage: newPic } : g));
      if (String(gId) === String(groupId))
        setActiveGroup(prev => ({ ...prev, profileImage: newPic }));
    } catch (err) { console.error("Pic upload failed:", err); }
    finally { setUploadingPic(false); }
  };

  // ── render file bubble ────────────────────────────────────
  const renderFilePreview = (msg) => {
    if (!msg.fileUrl) return null;
    const type       = getFileType(msg.fileName || "");
    const canPreview = PREVIEWABLE.includes(type);

    if (type === "image") return (
      <div className="cp-img-wrap">
        <img src={msg.fileUrl} alt={msg.fileName} className="cp-msg-img"
          onClick={() => openPreview(msg.fileUrl, msg.fileName, type)}
          onError={e => { e.target.style.display = "none"; }} />
        <button className="cp-img-dl" onClick={() => handleDownload(msg.fileUrl, msg.fileName)} title="Download">⬇</button>
      </div>
    );

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
              <button className="cp-action-btn" title="Group Info"
                onClick={() => navigate(`/groups/${groupId}`)}>ℹ️</button>
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
            {uploading && <div className="cp-uploading">Uploading…</div>}
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
            {/* Single hidden file input — accept set dynamically by openFilePicker */}
            <input ref={fileRef} type="file" style={{ display: "none" }}
              onChange={e => { handleFileSelect(e.target.files[0]); e.target.value = ""; }} />

            <div className="cp-file-menu-wrap" ref={fileMenuRef}>
              <button className={`cp-attach-btn ${showFileMenu ? "active" : ""}`} title="Share file"
                onClick={() => setShowFileMenu(p => !p)}>
                <span className="cp-attach-icon">📎</span>
                <span className="cp-attach-label">Share</span>
              </button>
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
                  {previewLoading && (
                    <div className="cp-preview-loading">Loading preview…</div>
                  )}

                  {/* Image */}
                  {!previewLoading && preview.type === "image" && (
                    <img src={preview.blobUrl} alt={preview.name} />
                  )}

                  {/* PDF */}
                  {!previewLoading && preview.type === "pdf" && (
                    <iframe src={preview.blobUrl} title={preview.name}
                      style={{ width:"100%", height:"65vh", border:"none" }} />
                  )}

                  {/* Plain text / CSV */}
                  {!previewLoading && (preview.type === "txt" || preview.type === "csv") && (
                    <pre className="cp-preview-text">{preview.text || "(empty file)"}</pre>
                  )}

                  {/* Office files — download-only with nice message */}
                  {!previewLoading && OFFICE_TYPES.includes(preview.type) && (
                    <div className="cp-preview-unsupported">
                      <span>{FILE_ICONS[preview.type]}</span>
                      <p className="cp-preview-filename">{preview.name}</p>
                      <p className="cp-preview-hint">
                        {preview.type === "excel" && "Excel spreadsheets"}
                        {preview.type === "word"  && "Word documents"}
                        {preview.type === "ppt"   && "PowerPoint presentations"}
                        {" "}can't be previewed in the browser.
                      </p>
                      <p className="cp-preview-sub">Download the file to open it in Microsoft Office or a compatible app.</p>
                      <button onClick={() => handleDownload(preview.url, preview.name)}>⬇ Download to Open</button>
                    </div>
                  )}

                  {/* Unknown / other */}
                  {!previewLoading && !PREVIEWABLE.includes(preview.type) && (
                    <div className="cp-preview-unsupported">
                      <span>📎</span>
                      <p className="cp-preview-filename">{preview.name}</p>
                      <p className="cp-preview-hint">This file type can't be previewed in the browser.</p>
                      <button onClick={() => handleDownload(preview.url, preview.name)}>⬇ Download to Open</button>
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