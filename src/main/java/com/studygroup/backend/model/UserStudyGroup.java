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
    }
)
public class UserStudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 👤 User who is joining the group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 👥 Study group
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private StudyGroup studyGroup;

    // 🔐 ADMIN / MEMBER
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GroupRole role;

    // ⏳ PENDING / APPROVED
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JoinStatus status;

    // 🕒 When user joined / requested
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime joinedAt;

    // ===== GETTERS & SETTERS =====

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public StudyGroup getStudyGroup() {
        return studyGroup;
    }

    public void setStudyGroup(StudyGroup studyGroup) {
        this.studyGroup = studyGroup;
    }

    public GroupRole getRole() {
        return role;
    }

    public void setRole(GroupRole role) {
        this.role = role;
    }

    public JoinStatus getStatus() {
        return status;
    }

    public void setStatus(JoinStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedAt() {
        return joinedAt;
    }
}