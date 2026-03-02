package com.studygroup.backend.model;

import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_study_groups",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "group_id"})
    },
    indexes = {
        @Index(name = "idx_usg_user_id", columnList = "user_id"),
        @Index(name = "idx_usg_group_id", columnList = "group_id"),
        @Index(name = "idx_usg_status", columnList = "status"),
        @Index(name = "idx_usg_role", columnList = "role"),
        @Index(name = "idx_usg_user_status", columnList = "user_id, status"),
        @Index(name = "idx_usg_group_status", columnList = "group_id, status")
    }
)
public class UserStudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup studyGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JoinStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public StudyGroup getStudyGroup() { return studyGroup; }
    public void setStudyGroup(StudyGroup studyGroup) { this.studyGroup = studyGroup; }
    public GroupRole getRole() { return role; }
    public void setRole(GroupRole role) { this.role = role; }
    public JoinStatus getStatus() { return status; }
    public void setStatus(JoinStatus status) { this.status = status; }
    public LocalDateTime getJoinedAt() { return joinedAt; }
}