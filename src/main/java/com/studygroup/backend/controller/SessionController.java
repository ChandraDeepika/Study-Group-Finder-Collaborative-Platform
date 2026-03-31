package com.studygroup.backend.controller;

import com.studygroup.backend.dto.SessionRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.service.SessionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Session APIs", description = "Manage study group sessions")
public class SessionController {

    private final SessionService sessionService;

    // ✅ CREATE SESSION
    @PostMapping
    @Operation(summary = "Create a new study session")
    public ResponseEntity<SessionResponse> createSession(
            @Valid @RequestBody SessionRequest request) {

        log.info("API request: Create session for groupId={}", request.getGroupId());

        SessionResponse response = sessionService.createSession(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ✅ GET ALL SESSIONS BY GROUP (WITH PAGINATION)
    @GetMapping("/group/{groupId}")
    @Operation(summary = "Get all sessions for a specific group")
    public ResponseEntity<List<SessionResponse>> getSessionsByGroup(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API request: Get sessions for groupId={}, page={}, size={}",
                groupId, page, size);

        List<SessionResponse> sessions = sessionService
                .getSessionsByGroup(groupId); // can upgrade to pageable later

        return ResponseEntity.ok(sessions);
    }

    // ✅ GET SESSION BY ID
    @GetMapping("/{id}")
    @Operation(summary = "Get session by ID")
    public ResponseEntity<SessionResponse> getSessionById(@PathVariable Long id) {

        log.info("API request: Get session with id={}", id);

        SessionResponse response = sessionService.getSessionById(id);

        return ResponseEntity.ok(response);
    }

    // ❌ DELETE SESSION
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a session")
    public ResponseEntity<String> deleteSession(@PathVariable Long id) {

        log.warn("API request: Delete session with id={}", id);

        sessionService.deleteSession(id);

        return ResponseEntity.ok("Session deleted successfully");
    }

    // 🔥 UPCOMING SESSIONS (BONUS API)
    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming sessions (next 1 hour)")
    public ResponseEntity<List<SessionResponse>> getUpcomingSessions() {

        log.info("API request: Get upcoming sessions");

        List<SessionResponse> sessions = sessionService.getUpcomingSessions()
                .stream()
                .map(session -> SessionResponse.builder()
                        .id(session.getId())
                        .groupId(session.getGroupId())
                        .title(session.getTitle())
                        .description(session.getDescription())
                        .dateTime(session.getDateTime())
                        .createdBy(session.getCreatedBy())
                        .isUpcoming(true)
                        .build())
                .toList();

        return ResponseEntity.ok(sessions);
    }
}