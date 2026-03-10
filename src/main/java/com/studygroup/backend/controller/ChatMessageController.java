package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ChatMessageResponse;
import com.studygroup.backend.dto.SendMessageRequest;
import com.studygroup.backend.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups/{groupId}/chat")
public class ChatMessageController {

    private final ChatMessageService chatService;

    public ChatMessageController(ChatMessageService chatService) {
        this.chatService = chatService;
    }

    // GET /api/groups/{groupId}/chat
    // Get all messages for a group (members only)
    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(chatService.getMessages(groupId));
    }

    // POST /api/groups/{groupId}/chat
    // Send a message to a group
    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long groupId,
            @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(groupId, request));
    }

    // PUT /api/groups/{groupId}/chat/{messageId}
    // Edit a message (sender only)
    @PutMapping("/{messageId}")
    public ResponseEntity<ChatMessageResponse> editMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(chatService.editMessage(messageId, body.get("content")));
    }

    // DELETE /api/groups/{groupId}/chat/{messageId}
    // Soft delete a message (sender only)
    @DeleteMapping("/{messageId}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId) {
        chatService.deleteMessage(messageId);
        return ResponseEntity.ok("Message deleted");
    }
}