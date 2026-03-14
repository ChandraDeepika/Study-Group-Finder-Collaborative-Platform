package com.studygroup.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_group_id", columnList = "group_id"),
                @Index(name = "idx_chat_sender_id", columnList = "sender_id"),
                @Index(name = "idx_chat_sent_at", columnList = "timestamp")
        }
)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "message_text", length = 1000)
    private String messageText;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageType messageType = MessageType.TEXT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageStatus status = MessageStatus.SENT;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_deleted")
    private boolean deleted = false;

    @Column(name = "is_edited")
    private boolean edited = false;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    public ChatMessage() {}

    public ChatMessage(StudyGroup group, User sender, String messageText) {
        this.group = group;
        this.sender = sender;
        this.messageText = messageText;
        this.content = messageText;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() { return id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }

    // Alias for service compatibility
    public StudyGroup getStudyGroup() { return group; }
    public void setStudyGroup(StudyGroup group) { this.group = group; }

    public Long getGroupId() { return group != null ? group.getId() : null; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public Long getSenderId() { return sender != null ? sender.getId() : null; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) {
        this.messageText = messageText;
        this.content = messageText;  // keep both columns in sync
    }

    public String getContent() { return content; }
    public void setContent(String content) {
        this.content = content;
        this.messageText = content;  // keep both columns in sync
    }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // Alias for service compatibility
    public LocalDateTime getSentAt() { return timestamp; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
}