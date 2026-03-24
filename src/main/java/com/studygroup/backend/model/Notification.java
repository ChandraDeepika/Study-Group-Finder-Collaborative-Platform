package com.studygroup.backend.model;

import com.studygroup.backend.model.enums.NotificationStatus;
import com.studygroup.backend.model.enums.NotificationType;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id"),
                @Index(name = "idx_status", columnList = "status"),
                @Index(name = "idx_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Notification {

    // 🔑 PRIMARY KEY
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👤 USER RECEIVING NOTIFICATION
    @Column(name = "user_id", nullable = false)
    @NotNull(message = "User ID is required")
    private Long userId;

    // 🔔 TYPE (REMINDER / INVITATION)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Notification type is required")
    private NotificationType type;

    // 📩 MESSAGE CONTENT
    @Column(nullable = false, length = 255)
    private String message;

    // 📌 REFERENCE (SESSION ID / GROUP ID)
    @Column(name = "reference_id")
    private Long referenceId;

    // 📊 STATUS (READ / UNREAD)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.UNREAD;

    // 📅 AUDIT FIELD
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // 🔥 ENTITY LIFECYCLE

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = NotificationStatus.UNREAD;
        }
    }

    // 🔥 BUSINESS METHODS (ADVANCED)

    public boolean isRead() {
        return this.status == NotificationStatus.READ;
    }

    public boolean isUnread() {
        return this.status == NotificationStatus.UNREAD;
    }

    public void markAsRead() {
        this.status = NotificationStatus.READ;
    }

    public void markAsUnread() {
        this.status = NotificationStatus.UNREAD;
    }
}