package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ChatMessageDTO;
import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.service.ChatService;

import jakarta.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Get complete chat history for a group
     */
    @GetMapping("/{groupId}")
    public List<ChatMessage> getGroupMessages(@PathVariable Long groupId) {

        logger.info("Fetching chat history for groupId={}", groupId);

        return chatService.getGroupMessages(groupId);
    }

    /**
     * Get paginated messages (recommended for large chats)
     */
    @GetMapping("/{groupId}/messages")
    public Page<ChatMessage> getPaginatedMessages(
            @PathVariable Long groupId,
            Pageable pageable
    ) {

        logger.info("Fetching paginated messages for groupId={}", groupId);

        return chatService.getPaginatedMessages(groupId, pageable);
    }

    /**
     * Search messages in group chat
     */
    @GetMapping("/{groupId}/search")
    public List<ChatMessage> searchMessages(
            @PathVariable Long groupId,
            @RequestParam String keyword
    ) {

        logger.info("Searching messages in groupId={} keyword={}", groupId, keyword);

        return chatService.searchMessages(groupId, keyword);
    }

    /**
     * Get unread message count
     */
    @GetMapping("/{groupId}/unread/{userId}")
    public Long getUnreadMessageCount(
            @PathVariable Long groupId,
            @PathVariable Long userId
    ) {

        return chatService.countUnreadMessages(groupId, userId);
    }

    /**
     * Mark messages as read
     */
    @PutMapping("/{groupId}/read/{userId}")
    public void markMessagesAsRead(
            @PathVariable Long groupId,
            @PathVariable Long userId
    ) {

        chatService.markMessagesAsRead(groupId, userId);
    }

    /**
     * Soft delete message
     */
    @DeleteMapping("/{messageId}")
    public void deleteMessage(@PathVariable Long messageId) {

        chatService.deleteMessage(messageId);
    }

    /**
     * WebSocket - Send message
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/group")
    public ChatMessage sendMessage(
            @Valid @Payload ChatMessageDTO messageDTO
    ) {

        logger.info("New message received groupId={} senderId={}",
                messageDTO.getGroupId(),
                messageDTO.getSenderId());

        return chatService.saveMessage(messageDTO);
    }

}