package com.studygroup.backend.model;

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
public class UserCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =============================
    // RELATIONSHIPS
    // =============================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // =============================
    // COURSE PROGRESS TRACKING
    // =============================

    @Column(nullable = false)
    private int progress = 0;  // 0 - 100 %

    @Column(nullable = false)
    private boolean started = false;

    @Column(nullable = false)
    private boolean completed = false;

    // =============================
    // METADATA
    // =============================

    @Column(nullable = false)
    private LocalDateTime enrolledAt = LocalDateTime.now();

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