package com.studygroup.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Session entity — stores scheduled study sessions.
 *
 * Foreign Key relationships (data integrity):
 *   - group_id  → study_groups(id)  ON DELETE CASCADE
 *   - created_by → users(id)        ON DELETE CASCADE
 *
 * Indexes (performance):
 *   - idx_session_group_id  : fast lookup of all sessions for a group
 *   - idx_session_date      : fast filtering of upcoming sessions by date
 */
@Entity
@Table(
    name = "sessions",
    indexes = {
        @Index(name = "idx_session_group_id", columnList = "group_id"),
        @Index(name = "idx_session_date",     columnList = "session_date")
    }
)
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * FK → study_groups(id)
     * ON DELETE CASCADE: deleting a group removes all its sessions automatically.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "group_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_sessions_group",
            foreignKeyDefinition = "FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE"
        )
    )
    private StudyGroup group;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    /**
     * FK → users(id)
     * ON DELETE CASCADE: deleting a user removes all sessions they created.
     * NOT NULL so SET NULL is not an option — CASCADE is the correct choice.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "created_by",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_sessions_creator",
            foreignKeyDefinition = "FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE"
        )
    )
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ── Getters & Setters ──────────────────────────────────────

    public Long getId() { return id; }

    public StudyGroup getGroup() { return group; }
    public void setGroup(StudyGroup group) { this.group = group; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
