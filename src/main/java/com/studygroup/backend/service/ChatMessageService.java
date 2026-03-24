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

@Service
@Transactional
public class ChatMessageService {

    private final ChatMessageRepository chatRepo;
    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final UserStudyGroupRepository memberRepo;

    public ChatMessageService(ChatMessageRepository chatRepo,
                              StudyGroupRepository groupRepo,
                              UserRepository userRepo,
                              UserStudyGroupRepository memberRepo) {
        this.chatRepo = chatRepo;
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.memberRepo = memberRepo;
    }

    private User getCurrentUser() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    System.out.println("AUTH OBJECT: " + auth);
    System.out.println("AUTH NAME: " + auth.getName());
    System.out.println("PRINCIPAL: " + auth.getPrincipal());

    return userRepo.findByEmail(auth.getName())
            .orElseThrow(() -> {
                System.out.println("❌ USER NOT FOUND IN DB");
                return new RuntimeException("User not found");
            });
}

    private void verifyMembership(Long groupId, Long userId) {
        UserStudyGroup membership = memberRepo
                .findByStudyGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (membership.getStatus() != JoinStatus.APPROVED)
            throw new RuntimeException("Your membership is not approved yet");
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        User sender = m.getSender();
        return new ChatMessageResponse(
                m.getId(),
                m.getGroup().getId(),
                sender.getId(),
                sender.getName(),
                sender.getEmail(),
                sender.getProfileImage(),
                m.getMessageText(),
                m.getMessageType().name(),
                m.getFileUrl(),
                m.isEdited(),
                m.getStatus() != null ? m.getStatus().getValue() : "sent",
                m.getTimestamp(),
                m.getEditedAt()
        );
    }

    // =========================
    // SEND MESSAGE
    // =========================
    public ChatMessageResponse sendMessage(Long groupId, SendMessageRequest request) {
        User sender = getCurrentUser();
        verifyMembership(groupId, sender.getId());

        if (request.getContent() == null || request.getContent().isBlank())
            throw new RuntimeException("Message content cannot be empty");

        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

     MessageType type = request.getMessageType() != null
        ? request.getMessageType()
        : MessageType.TEXT;

        ChatMessage message = new ChatMessage();
        message.setGroup(group);
        message.setSender(sender);
        message.setMessageText(request.getContent().trim());
        message.setMessageType(type);
        message.setFileUrl(request.getFileUrl());
        message.setStatus(MessageStatus.SENT);
        message.setTimestamp(LocalDateTime.now());

        ChatMessage saved = chatRepo.save(message);

        // Build response with fileUrl for FILE/IMAGE types
        User s = saved.getSender();
        return new ChatMessageResponse(
                saved.getId(),
                saved.getGroup().getId(),
                s.getId(),
                s.getName(),
                s.getEmail(),
                s.getProfileImage(),
                saved.getMessageText(),
                saved.getMessageType().name(),
                saved.getFileUrl(),
                saved.isEdited(),
                saved.getStatus() != null ? saved.getStatus().getValue() : "sent",
                saved.getTimestamp(),
                saved.getEditedAt()
        );
    }

    // =========================
    // GET MESSAGES FOR GROUP
    // =========================
    public List<ChatMessageResponse> getMessages(Long groupId) {
        User user = getCurrentUser();
        verifyMembership(groupId, user.getId());

        return chatRepo.findByGroup_IdAndDeletedFalseOrderByTimestampAsc(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // EDIT MESSAGE
    // =========================
    public ChatMessageResponse editMessage(Long messageId, String newContent) {
        User user = getCurrentUser();

        ChatMessage message = chatRepo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(user.getId()))
            throw new RuntimeException("You can only edit your own messages");

        if (message.isDeleted())
            throw new RuntimeException("Cannot edit a deleted message");

        if (newContent == null || newContent.isBlank())
            throw new RuntimeException("Message content cannot be empty");

        message.setMessageText(newContent.trim());
        message.setEdited(true);
        message.setEditedAt(LocalDateTime.now());

        return toResponse(chatRepo.save(message));
    }

    // =========================
    // MARK MESSAGES AS READ
    // =========================
    @Transactional
    public void markMessagesAsRead(Long groupId) {
        User user = getCurrentUser();
        chatRepo.markMessagesAsRead(groupId, user.getId(), MessageStatus.READ);
    }

    // =========================
    // DELETE MESSAGE (soft delete)
    // =========================
    public void deleteMessage(Long messageId) {
        User user = getCurrentUser();

        ChatMessage message = chatRepo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSender().getId().equals(user.getId()))
            throw new RuntimeException("You can only delete your own messages");

        message.setDeleted(true);
        message.setMessageText("[This message was deleted]");
        chatRepo.save(message);
    }
}