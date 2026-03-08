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

    long countByUserId(Long userId);

    // Delete all memberships for a group (used when deleting a group)
    void deleteAllByStudyGroupId(Long studyGroupId);

    // Count approved members in a group
    int countByStudyGroupIdAndStatus(Long studyGroupId, JoinStatus status);

    // Count approved members in a group
  
    // =========================
    // GET USER GROUPS BY STATUS
    // =========================
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.studyGroup g " +
           "JOIN FETCH g.createdBy " +
           "WHERE m.user.id = :userId AND m.status = :status")
    List<UserStudyGroup> findByUserIdAndStatus(
            @Param("userId") Long userId,
            @Param("status") JoinStatus status);

    // =========================
    // GET USER ADMIN GROUPS
    // =========================
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.studyGroup g " +
           "JOIN FETCH g.createdBy " +
           "WHERE m.user.id = :userId AND m.role = :role AND m.status = :status")
    List<UserStudyGroup> findByUserIdAndRoleAndStatus(
            @Param("userId") Long userId,
            @Param("role") GroupRole role,
            @Param("status") JoinStatus status);

    // =========================
    // GET GROUP MEMBERS
    // =========================
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.user " +
           "WHERE m.studyGroup.id = :groupId")
    List<UserStudyGroup> findByStudyGroupIdWithUser(
            @Param("groupId") Long groupId);

    // =========================
    // GET ADMIN PENDING REQUESTS
    // =========================
    @Query("SELECT m FROM UserStudyGroup m " +
           "JOIN FETCH m.user u " +
           "JOIN FETCH m.studyGroup g " +
           "JOIN FETCH g.createdBy c " +
           "WHERE g.createdBy.id = :adminId AND m.status = 'PENDING'")
    List<UserStudyGroup> findPendingRequestsForAdmin(
            @Param("adminId") Long adminId);

}