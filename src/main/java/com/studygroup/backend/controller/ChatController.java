package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ChatMessageDTO;
import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.service.ChatService;

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

    @GetMapping("/{groupId}")
    public List<ChatMessage> getGroupMessages(@PathVariable Long groupId) {
        return chatService.getGroupMessages(groupId);
    }

    @GetMapping("/{groupId}/messages")
    public Page<ChatMessage> getPaginatedMessages(@PathVariable Long groupId, Pageable pageable) {
        return chatService.getPaginatedMessages(groupId, pageable);
    }

    @GetMapping("/{groupId}/search")
    public List<ChatMessage> searchMessages(@PathVariable Long groupId, @RequestParam String keyword) {
        return chatService.searchMessages(groupId, keyword);
    }

    @DeleteMapping("/{messageId}")
    public void deleteMessage(@PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
    }

    /**
     * WebSocket broadcast relay — pure pass-through, NO DB save.
     * Handles: TYPING, DELETE, READ, and already-saved message broadcasts.
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/group")
    public ChatMessageDTO sendMessage(@Payload ChatMessageDTO messageDTO) {
        logger.debug("WS relay type={} groupId={}", messageDTO.getType(), messageDTO.getGroupId());
        return messageDTO;
    }
}
