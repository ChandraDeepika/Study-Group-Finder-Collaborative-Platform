package com.studygroup.backend.repository;

import com.studygroup.backend.model.JoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JoinRequestRepository extends JpaRepository<JoinRequest, Long> {

    // Check if user already requested
    Optional<JoinRequest> findByUserIdAndGroupId(Long userId, Long groupId);

    // Get all requests for a group
    List<JoinRequest> findByGroupId(Long groupId);

    // Get all requests by user
    List<JoinRequest> findByUserId(Long userId);

    // Get pending requests for group
    List<JoinRequest> findByGroupIdAndStatus(Long groupId, String status);
}