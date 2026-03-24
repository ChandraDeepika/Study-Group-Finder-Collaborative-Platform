package com.studygroup.backend.controller;

import com.studygroup.backend.dto.SessionCreateRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.service.SessionService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService service;

    public SessionController(SessionService service) {
        this.service = service;
    }

    // CREATE SESSION
    @PostMapping
    public SessionResponse create(@Valid @RequestBody SessionCreateRequest request) {
        return service.createSession(request);
    }

    // GET SESSIONS BY GROUP
    @GetMapping("/group/{groupId}")
    public List<SessionResponse> getByGroup(@PathVariable Long groupId) {
        return service.getSessionsByGroup(groupId);
    }
}