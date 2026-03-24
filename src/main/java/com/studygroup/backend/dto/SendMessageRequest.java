
package com.studygroup.backend.dto;

import com.studygroup.backend.model.MessageType;

public class SendMessageRequest {

    private String content;
     private MessageType messageType; // ✅ FIXED

    private String fileUrl;

     public SendMessageRequest() {
        this.messageType = MessageType.TEXT;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

     public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }
    
    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}