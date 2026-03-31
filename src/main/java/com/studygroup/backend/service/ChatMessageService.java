package com.studygroup.backend.service;

import com.studygroup.backend.dto.ChatMessageResponse;
import com.studygroup.backend.dto.SendMessageRequest;
import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.model.MessageStatus;
import com.studygroup.backend.model.MessageType;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.model.enums.JoinStatus;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatRepo;
    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final UserStudyGroupRepository memberRepo;
    private final EmailService emailService;

    public ChatMessageService(ChatMessageRepository chatRepo,
                              StudyGroupRepository groupRepo,
                              UserRepository userRepo,
                              UserStudyGroupRepository memberRepo,
                              EmailService emailService) {
        this.chatRepo    = chatRepo;
        this.groupRepo   = groupRepo;
        this.userRepo    = userRepo;
        this.memberRepo  = memberRepo;
        this.emailService = emailService;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + auth.getName()));
    }

    private void verifyMembership(Long groupId, Long userId) {
        UserStudyGroup m = memberRepo.findByStudyGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));
        if (m.getStatus() != JoinStatus.APPROVED)
            throw new RuntimeException("Your membership is not approved yet");
    }

    private String resolveText(ChatMessage m) {
        String c = m.getContent();
        if (c != null && !c.isBlank()) return c;
        return m.getMessageText() != null ? m.getMessageText() : "";
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        User s = m.getSender();
        return new ChatMessageResponse(
                m.getId(), m.getGroup().getId(), s.getId(),
                s.getName(), s.getEmail(), s.getProfileImage(),
                resolveText(m), m.getMessageType().name(), m.getFileUrl(),
                m.isEdited(),
                m.getStatus() != null ? m.getStatus().getValue() : "sent",
                m.getTimestamp(), m.getEditedAt());
    }

    // =========================
    // SEND MESSAGE
    // =========================
    public ChatMessageResponse sendMessage(Long groupId, SendMessageRequest request) {
        User sender = getCurrentUser();
        verifyMembership(groupId, sender.getId());

        if (request.getContent() == null || request.getContent().isBlank())
            throw new RuntimeException("Message content cannot be empty");

        StudyGroup group = groupRepo.findById(Objects.requireNonNull(groupId))
                .orElseThrow(() -> new RuntimeException("Group not found"));

        MessageType type = request.getMessageType() != null
                ? request.getMessageType() : MessageType.TEXT;

        String text = request.getContent().trim();

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setContent(text);
        message.setMessageText(text);
        message.setMessageType(type);
        message.setFileUrl(request.getFileUrl());
        message.setStatus(MessageStatus.SENT);
        message.setTimestamp(LocalDateTime.now());

        ChatMessageResponse response = toResponse(chatRepo.save(message));

        // Email all OTHER approved members (not the sender) — async, never blocks
        if (type == MessageType.TEXT) {
            List<String> others = memberRepo.findByStudyGroupIdWithUser(groupId)
                    .stream()
                    .filter(m -> m.getStatus() == JoinStatus.APPROVED
                              && !m.getUser().getId().equals(sender.getId()))
                    .map(m -> m.getUser().getEmail())
                    .toList();
            emailService.sendNewChatMessage(others, group.getName(), sender.getName(), text);
        }

        return response;
    }

    // =========================
    // GET MESSAGES
    // =========================
    public List<ChatMessageResponse> getMessages(Long groupId) {
        User user = getCurrentUser();
        verifyMembership(groupId, user.getId());
        return chatRepo.findByGroup_IdAndDeletedFalseOrderByTimestampAsc(groupId)
                .stream().map(this::toResponse).toList();
    }

    // =========================
    // EDIT MESSAGE
    // =========================
    public ChatMessageResponse editMessage(Long messageId, String newContent) {
        User user = getCurrentUser();
        ChatMessage message = chatRepo.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getSender().getId().equals(user.getId()))
            throw new RuntimeException("You can only edit your own messages");
        if (message.isDeleted())
            throw new RuntimeException("Cannot edit a deleted message");
        if (newContent == null || newContent.isBlank())
            throw new RuntimeException("Message content cannot be empty");

        String text = newContent.trim();
        message.setContent(text);
        message.setMessageText(text);
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());
        return toResponse(chatRepo.save(message));
    }

    // =========================
    // MARK AS READ
    // =========================
    @Transactional
    public void markMessagesAsRead(Long groupId) {
        User user = getCurrentUser();
        chatRepo.markMessagesAsRead(groupId, user.getId(), MessageStatus.READ);
    }

    // =========================
    // DELETE (soft)
    // =========================
    public void deleteMessage(Long messageId) {
        User user = getCurrentUser();
        ChatMessage message = chatRepo.findById(Objects.requireNonNull(messageId))
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!message.getSender().getId().equals(user.getId()))
            throw new RuntimeException("You can only delete your own messages");
        message.setDeleted(true);
        message.setContent("[This message was deleted]");
        message.setMessageText("[This message was deleted]");
        chatRepo.save(message);
    }
}
