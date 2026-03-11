package com.studygroup.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum MessageStatus {

    SENT("sent"),
    DELIVERED("delivered"),
    READ("read"),
    FAILED("failed");

    private final String value;

    MessageStatus(String value) {
        this.value = value;
    }

    /**
     * Used when converting enum to JSON response
     */
    @JsonValue
    public String getValue() {
        return value;
    }

    /**
     * Convert JSON input to enum safely
     */
    @JsonCreator
    public static MessageStatus fromValue(String value) {

        return Arrays.stream(MessageStatus.values())
                .filter(status -> status.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid MessageStatus: " + value)
                );
    }

    /**
     * Check if message has been delivered
     */
    public boolean isDelivered() {
        return this == DELIVERED || this == READ;
    }

    /**
     * Check if message has been read
     */
    public boolean isRead() {
        return this == READ;
    }

    /**
     * Check if message failed to send
     */
    public boolean isFailed() {
        return this == FAILED;
    }

}