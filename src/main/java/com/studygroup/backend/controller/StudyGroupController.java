package com.studygroup.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.dto.GroupSearchRequest;
import com.studygroup.backend.dto.JoinRequestActionRequest;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService service;
    private final UserRepository userRepo;

    public StudyGroupController(StudyGroupService service,
                                UserRepository userRepo) {
        this.service = service;
        this.userRepo = userRepo;
    }

    @PostMapping
    public GroupResponse createGroup(@RequestBody CreateGroupRequest request) {
        return service.createGroup(request);
    }

    @PostMapping("/{groupId}/join")
    public String joinGroup(@PathVariable Long groupId) {
        return service.joinGroup(groupId);
    }

    @PostMapping("/{groupId}/join-requests")
    public void handleJoinRequest(
            @PathVariable Long groupId,
            @RequestBody JoinRequestActionRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        User admin = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        service.handleJoinRequest(groupId, admin.getId(), request);
    }

    @GetMapping
    public List<GroupResponse> getAllGroups() {
        return service.searchGroups(new GroupSearchRequest());
    }

    // Now uses sorting + pagination properly
    @GetMapping("/filter")
    public List<GroupResponse> filterGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String privacy,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false, defaultValue = "id") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size) {

        return service.filterGroups(keyword, privacy, courseId, sortBy, sortDir, page, size);
    }

    @GetMapping("/my-group-ids")
    public List<Long> getMyGroupIds() {
        return service.getJoinedGroupIds();
    }

    @GetMapping("/my-pending-ids")
    public List<Long> getMyPendingIds() {
        return service.getPendingGroupIds();
    }

    @GetMapping("/my-groups")
    public List<GroupResponse> getMyGroups() {
        return service.getMyGroups();
    }

    @GetMapping("/my")
    public List<GroupResponse> getMyAdminGroups() {
        return service.getMyAdminGroups();
    }

    // ⚠️ /{id} MUST be LAST
    @GetMapping("/{id}")
    public GroupResponse getGroup(@PathVariable Long id) {
        return service.getGroupById(id);
    }

    @GetMapping("/{groupId}/members")
    public List<GroupMemberResponse> getMembers(@PathVariable Long groupId) {
        return service.getGroupMembers(groupId);
    }
}