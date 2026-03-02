package com.studygroup.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;

public interface UserStudyGroupRepository
        extends JpaRepository<UserStudyGroup, Long> {

    Optional<UserStudyGroup> findByStudyGroupIdAndUserId(Long studyGroupId, Long userId);

    List<UserStudyGroup> findByStudyGroupId(Long studyGroupId);

    boolean existsByStudyGroupIdAndUserId(Long studyGroupId, Long userId);

    List<UserStudyGroup> findByUserId(Long userId);

    // Optimized: filter by user + status in DB (uses idx_usg_user_status index)
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.studyGroup g " +
           "JOIN FETCH g.createdBy " +
           "WHERE m.user.id = :userId AND m.status = :status")
    List<UserStudyGroup> findByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") JoinStatus status);

    // Optimized: filter by user + role + status in DB
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.studyGroup g " +
           "JOIN FETCH g.createdBy " +
           "WHERE m.user.id = :userId AND m.role = :role AND m.status = :status")
    List<UserStudyGroup> findByUserIdAndRoleAndStatus(
            @Param("userId") Long userId,
            @Param("role") GroupRole role,
            @Param("status") JoinStatus status);

    // Optimized: get members with user data (avoids N+1 on user)
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.user " +
           "WHERE m.studyGroup.id = :groupId")
    List<UserStudyGroup> findByStudyGroupIdWithUser(
            @Param("groupId") Long groupId);
}