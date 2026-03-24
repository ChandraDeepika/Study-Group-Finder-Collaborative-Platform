package com.studygroup.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_courses",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "course_id"})
        }
)
public class UserCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =============================
    // RELATIONSHIPS
    // =============================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // =============================
    // COURSE PROGRESS TRACKING
    // =============================

    @Column(nullable = false)
    private int progress = 0;

    @Column(nullable = false)
    private boolean started = false;

    @Column(nullable = false)
    private boolean completed = false;

    // =============================
    // METADATA
    // =============================

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    // Constructors
    public UserCourse() {}

    public UserCourse(User user, Course course) {
        this.user = user;
        this.course = course;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    // =============================
    // BUSINESS METHODS
    // =============================

    public void updateProgress(int newProgress) {

        this.progress = newProgress;
        this.started = true;
        this.lastAccessedAt = LocalDateTime.now();

        if (newProgress >= 100) {
            this.completed = true;
            this.progress = 100;
        }
    }
}