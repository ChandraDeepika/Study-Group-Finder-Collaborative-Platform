package com.studygroup.backend.repository;

import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.model.MessageStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // All non-deleted messages for a group, oldest first
    List<ChatMessage> findByGroup_IdAndDeletedFalseOrderByTimestampAsc(Long groupId);

    // Paginated messages, newest first (used by ChatService)
    Page<ChatMessage> findByGroup_IdAndDeletedFalseOrderByTimestampDesc(Long groupId, Pageable pageable);

    // Latest single message in a group (used by ChatService)
    Optional<ChatMessage> findTopByGroup_IdAndDeletedFalseOrderByTimestampDesc(Long groupId);

    // Count unread messages for a user in a group (used by ChatService)
    @Query("""
            SELECT COUNT(m)
            FROM ChatMessage m
            WHERE m.group.id = :groupId
            AND m.sender.id != :userId
            AND m.status <> 'READ'
            AND m.deleted = false
            """)
    Long countUnreadMessages(@Param("groupId") Long groupId, @Param("userId") Long userId);

    // Search messages by keyword (used by ChatService)
    @Query("""
            SELECT m FROM ChatMessage m
            WHERE m.group.id = :groupId
            AND LOWER(m.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
            AND m.deleted = false
            ORDER BY m.timestamp ASC
            """)
    List<ChatMessage> searchMessages(@Param("groupId") Long groupId, @Param("keyword") String keyword);

    // Mark all messages as read for a user in a group
    @Modifying
    @Query("""
            UPDATE ChatMessage m
            SET m.status = :status
            WHERE m.group.id = :groupId
            AND m.sender.id != :userId
            AND m.status <> :status
            """)
    int markMessagesAsRead(
            @Param("groupId") Long groupId,
            @Param("userId")  Long userId,
            @Param("status")  MessageStatus status
    );
}
