
package com.studygroup.backend.dto;

public class SendMessageRequest {

    private String content;
    private String messageType;
    private String fileUrl;

    public SendMessageRequest() {
        this.messageType = "TEXT";
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
}