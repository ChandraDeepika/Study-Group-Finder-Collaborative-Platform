package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ChatMessageResponse;
import com.studygroup.backend.dto.SendMessageRequest;
import com.studygroup.backend.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.studygroup.backend.model.MessageType;
import java.io.File;
import java.io.IOException;
import java.util.Objects;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
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
    @GetMapping
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(chatService.getMessages(groupId));
    }

    // POST /api/groups/{groupId}/chat  — text message
    @PostMapping
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @PathVariable Long groupId,
            @RequestBody SendMessageRequest request) {
        return ResponseEntity.ok(chatService.sendMessage(groupId, request));
    }

    // POST /api/groups/{groupId}/chat/upload  — file/image upload
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) throws IOException {

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf(".")).toLowerCase() : "";

        String fileName = System.currentTimeMillis() + "_" + (original != null ? original.replaceAll("[^a-zA-Z0-9._-]", "_") : "file");
        Path uploadDir = Path.of(System.getProperty("user.dir"), "uploads");
        Files.createDirectories(uploadDir);
        file.transferTo(Objects.requireNonNull(uploadDir.resolve(fileName).toFile()));
        
        String fileUrl = "/uploads/" + fileName;
        String[] imageExts = {".jpg", ".jpeg", ".png", ".gif", ".webp"};
        boolean isImage = java.util.Arrays.asList(imageExts).contains(ext);

        // Save as a chat message with fileUrl
        SendMessageRequest req = new SendMessageRequest();
        req.setContent(original);
       req.setMessageType(isImage ? MessageType.IMAGE : MessageType.FILE);
        req.setFileUrl(fileUrl);
        ChatMessageResponse saved = chatService.sendMessage(groupId, req);

        Map<String, String> result = new HashMap<>();
        result.put("fileUrl", fileUrl);
        result.put("fileName", original);
        result.put("messageType", isImage ? "IMAGE" : "FILE");
        result.put("messageId", String.valueOf(saved.getId()));
        return ResponseEntity.ok(result);
    }

    // PUT /api/groups/{groupId}/chat/read  — mark all messages as read
    @PutMapping("/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long groupId) {
        chatService.markMessagesAsRead(groupId);
        return ResponseEntity.ok().build();
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