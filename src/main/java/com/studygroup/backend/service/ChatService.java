package com.studygroup.backend.service;

import com.studygroup.backend.dto.ChatMessageDTO;
import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.model.MessageStatus;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final ChatMessageRepository chatMessageRepository;
    private final StudyGroupService studyGroupService;
    private final UserRepository userRepository;

    public ChatService(
            ChatMessageRepository chatMessageRepository,
            StudyGroupService studyGroupService,
            UserRepository userRepository) {

        this.chatMessageRepository = chatMessageRepository;
        this.studyGroupService = studyGroupService;
        this.userRepository = userRepository;
    }

    public ChatMessage saveMessage(ChatMessageDTO messageDTO) {
        validateMessage(messageDTO);
        ChatMessage message = convertToEntity(messageDTO);
        return saveMessage(message);
    }

    public ChatMessage saveMessage(ChatMessage message) {
        boolean isMember = studyGroupService.isUserMemberOfGroup(
                message.getSender().getId(),
                message.getGroup().getId()
        );

        if (!isMember) {
            logger.warn("Unauthorized chat attempt userId={} groupId={}",
                    message.getSender().getId(), message.getGroup().getId());
            throw new RuntimeException("User not authorized to chat in this group");
        }

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Reload full message with sender name populated
        return chatMessageRepository.findById(savedMessage.getId())
                .orElse(savedMessage);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> getGroupMessages(Long groupId) {
        return chatMessageRepository.findByGroup_IdAndDeletedFalseOrderByTimestampAsc(groupId);
    }

    @Transactional(readOnly = true)
    public Page<ChatMessage> getPaginatedMessages(Long groupId, Pageable pageable) {
        return chatMessageRepository.findByGroup_IdAndDeletedFalseOrderByTimestampDesc(groupId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<ChatMessage> getLatestMessage(Long groupId) {
        return chatMessageRepository.findTopByGroup_IdAndDeletedFalseOrderByTimestampDesc(groupId);
    }

    @Transactional(readOnly = true)
    public List<ChatMessage> searchMessages(Long groupId, String keyword) {
        return chatMessageRepository.searchMessages(groupId, keyword);
    }

    @Transactional(readOnly = true)
    public Long countUnreadMessages(Long groupId, Long userId) {
        return chatMessageRepository.countUnreadMessages(groupId, userId);
    }

    public void markMessagesAsRead(Long groupId, Long userId) {
        int updatedRows = chatMessageRepository.markMessagesAsRead(groupId, userId, MessageStatus.READ);
        logger.info("Marked {} messages as read for userId={} in groupId={}", updatedRows, userId, groupId);
    }

    public void deleteMessage(Long messageId) {
        Optional<ChatMessage> optionalMessage = chatMessageRepository.findById(messageId);
        if (optionalMessage.isPresent()) {
            ChatMessage message = optionalMessage.get();
            message.setDeleted(true);
            chatMessageRepository.save(message);
            logger.info("Message soft deleted id={}", messageId);
        } else {
            throw new RuntimeException("Message not found");
        }
    }

    private void validateMessage(ChatMessageDTO dto) {
        if (dto.getMessageText() == null || dto.getMessageText().trim().isEmpty())
            throw new IllegalArgumentException("Message cannot be empty");
        if (dto.getGroupId() == null)
            throw new IllegalArgumentException("GroupId is required");
        if (dto.getSenderId() == null)
            throw new IllegalArgumentException("SenderId is required");
    }

    private ChatMessage convertToEntity(ChatMessageDTO dto) {
        ChatMessage message = new ChatMessage();

        // Load full User and StudyGroup to get names
        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        StudyGroup group = new StudyGroup();
        group.setId(dto.getGroupId());

        message.setGroup(group);
        message.setSender(sender);
        message.setMessageText(dto.getMessageText());
        message.setTimestamp(LocalDateTime.now());
        message.setStatus(MessageStatus.SENT);

        return message;
    }
}