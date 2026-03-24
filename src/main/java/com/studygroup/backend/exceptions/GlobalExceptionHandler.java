package com.studygroup.backend.exceptions;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.AccessDeniedException;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle custom ChatException
     */
    @ExceptionHandler(ChatException.class)
    public ResponseEntity<Map<String, Object>> handleChatException(ChatException ex) {

        logger.warn("ChatException occurred: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("errorCode", ex.getErrorCode());
        response.put("message", ex.getMessage());
        response.put("status", ex.getStatus().value());
        response.put("timestamp", ex.getTimestamp());

        return ResponseEntity
                .status(Objects.requireNonNull(ex.getStatus()))
                .body(response);
    }

    /**
     * Handles business / validation errors
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {

        logger.warn("RuntimeException occurred: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", ex.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    /**
     * Handles authorization errors (403)
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {

        logger.warn("Access denied: {}", ex.getMessage());

        Map<String, Object> response = new HashMap<>();
        response.put("error", "Access denied");
        response.put("status", HttpStatus.FORBIDDEN.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(response);
    }

    /**
     * Fallback handler for unexpected errors
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {

        logger.error("Unexpected error occurred", ex);

        Map<String, Object> response = new HashMap<>();
        response.put("error", "Internal server error");
        response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.put("timestamp", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {

        Map<String, Object> error = new HashMap<>();
        error.put("message", ex.getMessage());
        error.put("errorCode", ex.getErrorCode());
        error.put("timestamp", ex.getTimestamp());

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

}