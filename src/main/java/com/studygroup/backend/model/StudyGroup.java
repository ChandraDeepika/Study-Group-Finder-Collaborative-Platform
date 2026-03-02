package com.studygroup.backend.model;

import com.studygroup.backend.model.enums.GroupPrivacy;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_groups", indexes = {
    @Index(name = "idx_sg_privacy", columnList = "privacy"),
    @Index(name = "idx_sg_course_id", columnList = "course_id"),
    @Index(name = "idx_sg_created_by", columnList = "created_by"),
    @Index(name = "idx_sg_created_at", columnList = "created_at"),
    @Index(name = "idx_sg_name", columnList = "name")
})
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupPrivacy privacy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public GroupPrivacy getPrivacy() { return privacy; }
    public void setPrivacy(GroupPrivacy privacy) { this.privacy = privacy; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}