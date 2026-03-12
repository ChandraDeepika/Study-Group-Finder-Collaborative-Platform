package com.studygroup.backend.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum MessageType {

    TEXT("text"),
    IMAGE("image"),
    FILE("file"),
    SYSTEM("system");

    private final String value;

    MessageType(String value) {
        this.value = value;
    }

    /**
     * Used when sending JSON response to frontend
     */
    @JsonValue
    public String getValue() {
        return value;
    }

    /**
     * Convert string to enum safely (used when receiving JSON)
     */
    @JsonCreator
    public static MessageType fromValue(String value) {

        return Arrays.stream(MessageType.values())
                .filter(type -> type.value.equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalArgumentException("Invalid MessageType: " + value)
                );
    }

    /**
     * Utility method to check if message contains media
     */
    public boolean isMediaType() {
        return this == IMAGE || this == FILE;
    }

    /**
     * Utility method for system messages
     */
    public boolean isSystemMessage() {
        return this == SYSTEM;
    }

}