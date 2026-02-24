package com.studygroup.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.dto.JoinRequestActionRequest;
import com.studygroup.backend.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService service;

    public StudyGroupController(StudyGroupService service) {
        this.service = service;
    }

    // =========================
    // CREATE GROUP
    // =========================
    @PostMapping
    public GroupResponse createGroup(
            @RequestBody CreateGroupRequest request) {

        return service.createGroup(request);
    }

    // =========================
    // APPROVE / REJECT JOIN REQUEST
    // =========================
    @PostMapping("/{groupId}/join-requests")
    public void handleJoinRequest(
            @PathVariable Long groupId,
            @RequestBody JoinRequestActionRequest request,
            Authentication authentication) {

        // NOTE: authentication.getName() must represent userId (as per your service design)
        Long adminId = Long.parseLong(authentication.getName());

        service.handleJoinRequest(groupId, adminId, request);
    }

    // =========================
    // GET GROUP MEMBERS
    // =========================
    @GetMapping("/{groupId}/members")
    public List<GroupMemberResponse> getMembers(
            @PathVariable Long groupId) {

        return service.getGroupMembers(groupId);
    }
}