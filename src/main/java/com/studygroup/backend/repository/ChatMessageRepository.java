package com.studygroup.backend.repository;

import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.model.MessageStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /**
     * Get complete chat history for a group
     */
    List<ChatMessage> findByGroup_IdAndDeletedFalseOrderByTimestampAsc(Long groupId);

    /**
     * Pagination support for large chats
     */
    Page<ChatMessage> findByGroup_IdAndDeletedFalseOrderByTimestampDesc(
            Long groupId,
            Pageable pageable
    );

    /**
     * Get latest message in a group (for chat preview)
     */
    Optional<ChatMessage> findTopByGroup_IdAndDeletedFalseOrderByTimestampDesc(Long groupId);

    /**
     * Count unread messages for a user
     */
    @Query("""
            SELECT COUNT(m)
            FROM ChatMessage m
            WHERE m.group.id = :groupId
            AND m.sender.id != :userId
            AND m.status <> 'READ'
            AND m.deleted = false
            """)
    Long countUnreadMessages(
            @Param("groupId") Long groupId,
            @Param("userId") Long userId
    );

    /**
     * Search messages in a group
     */
    @Query("""
            SELECT m
            FROM ChatMessage m
            WHERE m.group.id = :groupId
            AND LOWER(m.messageText) LIKE LOWER(CONCAT('%', :keyword, '%'))
            AND m.deleted = false
            ORDER BY m.timestamp ASC
            """)
    List<ChatMessage> searchMessages(
            @Param("groupId") Long groupId,
            @Param("keyword") String keyword
    );

    /**
     * Get messages after a specific timestamp
     */
    List<ChatMessage> findByGroup_IdAndTimestampAfterAndDeletedFalse(
            Long groupId,
            LocalDateTime timestamp
    );

    /**
     * Mark all messages as read for a user
     */
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
            @Param("userId") Long userId,
            @Param("status") MessageStatus status
    );

}