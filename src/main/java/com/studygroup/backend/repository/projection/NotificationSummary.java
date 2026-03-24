package com.studygroup.backend.repository.projection;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.studygroup.backend.model.enums.NotificationStatus;
import com.studygroup.backend.model.enums.NotificationType;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Lightweight Spring Data projection for notification list views.
 *
 * Fetches only the columns required for the UI — avoids loading
 * full entity graphs and improves query performance.
 *
 * Compatible with: NotificationRepository#findByRecipientId(Long, Pageable)
 */
public interface NotificationSummary {

    // ── Core fields ───────────────────────────────────────────────────────────

    Long getId();

    String getMessage();

    NotificationType getType();

    NotificationStatus getStatus();

    Long getRecipientId();

    Long getRelatedGroupId();      // nullable — not all notifications relate to a group

    Long getRelatedSessionId();    // nullable — not all notifications relate to a session

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getCreatedAt();

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime getReadAt();     // nullable — null until notification is read

    // ── Status helpers ────────────────────────────────────────────────────────

    /**
     * Returns true if the notification is pending user attention.
     */
    default boolean isUnread() {
        return getStatus() == NotificationStatus.UNREAD;
    }

    /**
     * Returns true if the notification has been actioned (read or archived).
     */
    default boolean isActioned() {
        return getStatus() != null && getStatus().isRead();
    }

    /**
     * Returns true if this notification is linked to a group.
     */
    default boolean hasRelatedGroup() {
        return getRelatedGroupId() != null;
    }

    /**
     * Returns true if this notification is linked to a session.
     */
    default boolean hasRelatedSession() {
        return getRelatedSessionId() != null;
    }

    // ── Type helpers ──────────────────────────────────────────────────────────

    /**
     * Returns the human-readable display name of the notification type.
     * e.g. "Session reminder", "Group invitation"
     */
    default String getTypeDisplayName() {
        return getType() != null ? getType().getDisplayName() : "Notification";
    }

    /**
     * Returns true if this is a session-related notification.
     */
    default boolean isSessionNotification() {
        return getType() == NotificationType.REMINDER
                || getType() == NotificationType.SESSION_CANCELLED;
    }

    /**
     * Returns true if this is a group membership notification.
     */
    default boolean isMembershipNotification() {
        return getType() == NotificationType.INVITATION
                || getType() == NotificationType.JOIN_REQUEST
                || getType() == NotificationType.JOIN_APPROVED
                || getType() == NotificationType.JOIN_REJECTED
                || getType() == NotificationType.MEMBER_LEFT;
    }

    // ── Time helpers ──────────────────────────────────────────────────────────

    /**
     * Returns a human-readable relative timestamp.
     * e.g. "Just now", "5 min ago", "2 hours ago", "3 days ago"
     */
    default String getRelativeTime() {
        LocalDateTime createdAt = getCreatedAt();
        if (createdAt == null) return "Unknown";

        long seconds = ChronoUnit.SECONDS.between(createdAt, LocalDateTime.now());

        if (seconds < 60)        return "Just now";
        if (seconds < 3_600)     return (seconds / 60) + " min ago";
        if (seconds < 86_400)    return (seconds / 3_600) + " hour" + (seconds / 3_600 == 1 ? "" : "s") + " ago";
        if (seconds < 604_800)   return (seconds / 86_400) + " day" + (seconds / 86_400 == 1 ? "" : "s") + " ago";
        if (seconds < 2_592_000) return (seconds / 604_800) + " week" + (seconds / 604_800 == 1 ? "" : "s") + " ago";
        return (seconds / 2_592_000) + " month" + (seconds / 2_592_000 == 1 ? "" : "s") + " ago";
    }

    /**
     * Returns a formatted creation timestamp for display.
     * e.g. "2025-06-15T10:30:00"
     */
    default String getFormattedCreatedAt() {
        return getCreatedAt() != null ? getCreatedAt().toString() : null;
    }

    /**
     * Returns true if the notification was created within the last 24 hours.
     */
    default boolean isRecent() {
        return getCreatedAt() != null
                && ChronoUnit.HOURS.between(getCreatedAt(), LocalDateTime.now()) < 24;
    }
}
