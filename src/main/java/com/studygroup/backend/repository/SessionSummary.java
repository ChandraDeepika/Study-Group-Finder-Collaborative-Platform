package com.studygroup.backend.repository;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * Projection Interface for lightweight session data.
 * Used to fetch only required fields instead of full entity.
 * Improves performance and reduces memory usage.
 */
public interface SessionSummary {

    // 🔑 SESSION ID
    Long getId();

    // 📝 SESSION TITLE
    String getTitle();

    // ⏰ SESSION DATE & TIME
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getDateTime();

    // 🔥 DEFAULT METHODS (ADVANCED FEATURE)

    /**
     * Check if session is upcoming
     */
    default boolean isUpcoming() {
        return getDateTime() != null && getDateTime().isAfter(LocalDateTime.now());
    }

    /**
     * Check if session is past
     */
    default boolean isPast() {
        return getDateTime() != null && getDateTime().isBefore(LocalDateTime.now());
    }

    /**
     * Human-readable formatted time (optional utility)
     */
    default String getFormattedDateTime() {
        if (getDateTime() == null) return null;
        return getDateTime().toString(); // can customize formatter later
    }
}