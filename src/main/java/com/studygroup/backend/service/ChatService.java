package com.studygroup.backend.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.studygroup.backend.model.ChatMessage;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.ChatMessageRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class ChatService {

    private final ChatMessageRepository repo;
    private final UserRepository userRepository;

    public ChatService(ChatMessageRepository repo, UserRepository userRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {

        // Get sender details
        User user = userRepository.findById(message.getSenderId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Set sender name
        message.setSenderName(user.getName());

        // Set message timestamp
        message.setCreatedAt(LocalDateTime.now());

        // Save message
        return repo.save(message);
    }
}