package com.studygroup.backend.repository;

import com.studygroup.backend.model.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Get all non-deleted messages for a group, newest last
    @Query("SELECT m FROM ChatMessage m " +
           "JOIN FETCH m.sender " +
           "WHERE m.studyGroup.id = :groupId AND m.deleted = false " +
           "ORDER BY m.sentAt ASC")
    List<ChatMessage> findByGroupId(@Param("groupId") Long groupId);

    // Get paginated messages for a group (for large chat histories)
    @Query("SELECT m FROM ChatMessage m " +
           "JOIN FETCH m.sender " +
           "WHERE m.studyGroup.id = :groupId AND m.deleted = false")
    Page<ChatMessage> findByGroupIdPaged(
            @Param("groupId") Long groupId,
            Pageable pageable);

    // Count messages in a group
    long countByStudyGroupIdAndDeletedFalse(Long groupId);
}