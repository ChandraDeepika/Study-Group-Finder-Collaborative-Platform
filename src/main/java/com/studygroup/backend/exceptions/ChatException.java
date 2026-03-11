package com.studygroup.backend.exceptions;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public class ChatException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus status;
    private final LocalDateTime timestamp;

    public ChatException(String message) {
        super(message);
        this.errorCode = "CHAT_ERROR";
        this.status = HttpStatus.BAD_REQUEST;
        this.timestamp = LocalDateTime.now();
    }

    public ChatException(String message, HttpStatus status) {
        super(message);
        this.errorCode = "CHAT_ERROR";
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public ChatException(String message, String errorCode, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public ChatException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "CHAT_INTERNAL_ERROR";
        this.status = HttpStatus.INTERNAL_SERVER_ERROR;
        this.timestamp = LocalDateTime.now();
    }

    public String getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}