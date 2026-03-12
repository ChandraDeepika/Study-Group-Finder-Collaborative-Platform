package com.studygroup.backend.repository;

import java.util.List;   // ✅ correct import

import org.springframework.data.jpa.repository.JpaRepository;

import com.studygroup.backend.model.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByGroupIdOrderByCreatedAtAsc(Long groupId);

}