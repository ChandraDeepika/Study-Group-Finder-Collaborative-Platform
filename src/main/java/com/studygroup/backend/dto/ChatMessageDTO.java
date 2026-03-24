package com.studygroup.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.studygroup.backend.model.MessageType;
import com.studygroup.backend.model.MessageStatus;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageDTO {

    private Long id;
    private Long groupId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String type;         // TYPING | DELETE | READ | null (normal message)
    private String messageText;
    private String content;
    private String fileUrl;
    private MessageType messageType = MessageType.TEXT;
    private MessageStatus status;
    private LocalDateTime timestamp;
    private boolean edited;
    private boolean deleted;
    private boolean isTyping;
    private Long messageId;      // used for DELETE events
    private String readerEmail;  // used for READ events

    public ChatMessageDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public MessageStatus getStatus() { return status; }
    public void setStatus(MessageStatus status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isTyping() { return isTyping; }
    public void setTyping(boolean typing) { isTyping = typing; }

    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }

    public String getReaderEmail() { return readerEmail; }
    public void setReaderEmail(String readerEmail) { this.readerEmail = readerEmail; }
}
