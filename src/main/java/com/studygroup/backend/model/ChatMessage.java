package com.studygroup.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "chat_messages",
        indexes = {
                @Index(name = "idx_group_timestamp", columnList = "group_id,timestamp"),
                @Index(name = "idx_sender", columnList = "sender_id")
        }
)
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Many messages belong to one group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup group;

    // Many messages belong to one sender
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotBlank
    @Column(name = "message_text", length = 1000, nullable = false)
    private String messageText;

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

    public ChatMessage() {}

    public ChatMessage(StudyGroup group, User sender, String messageText) {
        this.group = group;
        this.sender = sender;
        this.messageText = messageText;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }

    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public StudyGroup getGroup() {
        return group;
    }

    public Long getGroupId() {
        return group != null ? group.getId() : null;
    }

    public User getSender() {
        return sender;
    }

    public Long getSenderId() {
        return sender != null ? sender.getId() : null;
    }

    public String getMessageText() {
        return messageText;
    }

    public MessageType getMessageType() {
        return messageType;
    }

    public MessageStatus getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public boolean isDeleted() {
        return deleted;
    }

    // =========================
    // SETTERS
    // =========================

    public void setGroup(StudyGroup group) {
        this.group = group;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
    }

    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }

    public void setStatus(MessageStatus status) {
        this.status = status;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
}