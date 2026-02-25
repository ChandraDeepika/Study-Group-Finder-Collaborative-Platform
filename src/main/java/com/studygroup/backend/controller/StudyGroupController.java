package com.studygroup.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.dto.GroupSearchRequest;
import com.studygroup.backend.dto.JoinRequestActionRequest;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService service;
    private final UserRepository userRepo;   // ✅ needed for admin lookup

    public StudyGroupController(StudyGroupService service,
                                UserRepository userRepo) {
        this.service = service;
        this.userRepo = userRepo;
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
    // ✅ JOIN GROUP (NEW)
    // =========================
    @PostMapping("/{groupId}/join")
    public String joinGroup(@PathVariable Long groupId) {

        return service.joinGroup(groupId);
    }

    // =========================
    // APPROVE / REJECT JOIN REQUEST
    // =========================
    @PostMapping("/{groupId}/join-requests")
    public void handleJoinRequest(
            @PathVariable Long groupId,
            @RequestBody JoinRequestActionRequest request,
            Authentication authentication) {

        // get admin via email (consistent with service)
        String email = authentication.getName();

        User admin = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        service.handleJoinRequest(groupId, admin.getId(), request);
    }

    @GetMapping
public List<StudyGroup> getAllGroups() {
    return service.searchGroups(new GroupSearchRequest());
}
@GetMapping("/{id}")
public StudyGroup getGroup(@PathVariable Long id) {
    return service.getGroupById(id);
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