package com.studygroup.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.model.UserStudyGroup;

public interface UserStudyGroupRepository
        extends JpaRepository<UserStudyGroup, Long> {

    Optional<UserStudyGroup> findByStudyGroupIdAndUserId(
            Long studyGroupId,
            Long userId
    );

    List<UserStudyGroup> findByStudyGroupId(Long studyGroupId);
}