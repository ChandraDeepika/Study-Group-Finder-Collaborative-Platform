package com.studygroup.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.studygroup.backend.model.MessageType;
import com.studygroup.backend.model.MessageStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageDTO {

    private Long id;

    @NotNull(message = "Group ID is required")
    private Long groupId;

    @NotNull(message = "Sender ID is required")
    private Long senderId;

    private String senderName;

    @NotBlank(message = "Message cannot be empty")
    @Size(max = 1000, message = "Message cannot exceed 1000 characters")
    private String messageText;

    private MessageType messageType = MessageType.TEXT;

    private MessageStatus status = MessageStatus.SENT;

    private LocalDateTime timestamp;

    private boolean edited;

    private boolean deleted;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Long groupId, Long senderId, String messageText) {
        this.groupId = groupId;
        this.senderId = senderId;
        this.messageText = messageText;
        this.timestamp = LocalDateTime.now();
    }

    // GETTERS AND SETTERS

    public Long getId() {
        return id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
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

    public boolean isEdited() {
        return edited;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
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

    public void setEdited(boolean edited) {
        this.edited = edited;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }
}