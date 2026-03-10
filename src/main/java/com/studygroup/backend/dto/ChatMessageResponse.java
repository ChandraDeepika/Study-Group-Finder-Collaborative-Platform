package com.studygroup.backend.dto;

import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderProfileImage;
    private String content;
    private String messageType;
    private String fileUrl;
    private boolean edited;
    private LocalDateTime sentAt;
    private LocalDateTime editedAt;

    public ChatMessageResponse(Long id,
                               Long groupId,
                               Long senderId,
                               String senderName,
                               String senderEmail,
                               String senderProfileImage,
                               String content,
                               String messageType,
                               String fileUrl,
                               boolean edited,
                               LocalDateTime sentAt,
                               LocalDateTime editedAt) {
        this.id = id;
        this.groupId = groupId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.senderProfileImage = senderProfileImage;
        this.content = content;
        this.messageType = messageType;
        this.fileUrl = fileUrl;
        this.edited = edited;
        this.sentAt = sentAt;
        this.editedAt = editedAt;
    }

    public Long getId() { return id; }
    public Long getGroupId() { return groupId; }
    public Long getSenderId() { return senderId; }
    public String getSenderName() { return senderName; }
    public String getSenderEmail() { return senderEmail; }
    public String getSenderProfileImage() { return senderProfileImage; }
    public String getContent() { return content; }
    public String getMessageType() { return messageType; }
    public String getFileUrl() { return fileUrl; }
    public boolean isEdited() { return edited; }
    public LocalDateTime getSentAt() { return sentAt; }
    public LocalDateTime getEditedAt() { return editedAt; }
}