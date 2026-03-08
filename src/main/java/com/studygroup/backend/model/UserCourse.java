package com.studygroup.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_courses",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "course_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
//@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    //@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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