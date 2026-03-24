package com.studygroup.backend.controller;

import com.studygroup.backend.dto.SessionRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups/{groupId}/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping
    public ResponseEntity<SessionResponse> create(
            @PathVariable Long groupId,
            @RequestBody SessionRequest request) {
        return ResponseEntity.ok(sessionService.createSession(groupId, request));
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> getAll(@PathVariable Long groupId) {
        return ResponseEntity.ok(sessionService.getGroupSessions(groupId));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<SessionResponse>> getUpcoming(@PathVariable Long groupId) {
        return ResponseEntity.ok(sessionService.getUpcomingSessions(groupId));
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<String> delete(
            @PathVariable Long groupId,
            @PathVariable Long sessionId) {
        sessionService.deleteSession(groupId, sessionId);
        return ResponseEntity.ok("Session deleted");
    }
}
