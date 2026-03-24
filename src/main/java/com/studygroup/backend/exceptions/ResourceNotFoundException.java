package com.studygroup.backend.exceptions;

import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Custom exception for handling resource not found scenarios.
 * Example: Session not found, Group not found, User not found
 */
@Getter
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;
    private final String errorCode;
    private final LocalDateTime timestamp;

    /**
     * Constructor with full details (industry standard)
     */
    public ResourceNotFoundException(String resourceName,
                                     String fieldName,
                                     Object fieldValue) {
        super(String.format("%s not found with %s: '%s'",
                resourceName, fieldName, fieldValue));

        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.errorCode = "RESOURCE_NOT_FOUND";
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Constructor with custom message
     */
    public ResourceNotFoundException(String message) {
        super(message);

        this.resourceName = null;
        this.fieldName = null;
        this.fieldValue = null;
        this.errorCode = "RESOURCE_NOT_FOUND";
        this.timestamp = LocalDateTime.now();
    }
}