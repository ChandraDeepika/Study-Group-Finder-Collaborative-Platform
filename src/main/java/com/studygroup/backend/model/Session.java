package com.studygroup.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "sessions",
    indexes = {
        @Index(name = "idx_session_group_id", columnList = "group_id"),
        @Index(name = "idx_session_date", columnList = "session_date")
    }
)
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK → study_groups
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "group_id",
        nullable = false
    )
    private StudyGroup group;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "session_date", nullable = false)
    private LocalDateTime sessionDate;

    // FK → users
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "created_by",
        nullable = false
    )
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // =========================
    // GETTERS & SETTERS
    // =========================

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