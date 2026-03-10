package com.studygroup.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_group_id", columnList = "group_id"),
        @Index(name = "idx_chat_sender_id", columnList = "sender_id"),
        @Index(name = "idx_chat_sent_at", columnList = "sent_at")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The group this message belongs to
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup studyGroup;

    // The user who sent the message
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    // Message content
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // Message type: TEXT, IMAGE, FILE
    @Column(nullable = false)
    private String messageType = "TEXT";

    // Optional: file URL if messageType is IMAGE or FILE
    @Column
    private String fileUrl;

    // Whether the message has been edited
    @Column(nullable = false)
    private boolean edited = false;

    // Whether the message has been deleted (soft delete)
    @Column(nullable = false)
    private boolean deleted = false;

    // Timestamp when the message was sent
    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    // Timestamp when the message was last edited
    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() { return id; }

    public StudyGroup getStudyGroup() { return studyGroup; }
    public void setStudyGroup(StudyGroup studyGroup) { this.studyGroup = studyGroup; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getSentAt() { return sentAt; }

    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
}