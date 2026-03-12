package com.studygroup.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.dto.JoinRequestActionRequest;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService service;
    private final UserRepository userRepo;

    public StudyGroupController(StudyGroupService service, UserRepository userRepo) {
        this.service = service;
        this.userRepo = userRepo;
    }

    // =========================
    // CREATE GROUP
    // =========================
    @PostMapping
    public GroupResponse createGroup(@RequestBody CreateGroupRequest request) {
        return service.createGroup(request);
    }

    // =========================
    // JOIN GROUP
    // =========================
    @PostMapping("/{groupId}/join")
    public String joinGroup(@PathVariable Long groupId) {
        return service.joinGroup(groupId);
    }

    // =========================
    // APPROVE / REJECT JOIN
    // =========================
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

    // =========================
    // LEAVE GROUP
    // =========================
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<String> leaveGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        service.leaveGroup(groupId, authentication.getName());
        return ResponseEntity.ok("Left group successfully");
    }

    // =========================
    // REMOVE MEMBER (admin only)
    // =========================
    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            Authentication authentication) {

        service.removeMember(groupId, userId, authentication.getName());
        return ResponseEntity.ok("Member removed successfully");
    }

    // =========================
    // TRANSFER ADMIN ROLE
    // =========================
    @PostMapping("/{groupId}/transfer-admin/{newAdminUserId}")
    public ResponseEntity<String> transferAdmin(
            @PathVariable Long groupId,
            @PathVariable Long newAdminUserId,
            Authentication authentication) {

        service.transferAdmin(groupId, newAdminUserId, authentication.getName());
        return ResponseEntity.ok("Admin role transferred successfully");
    }

    // =========================
    // DELETE GROUP (admin only)
    // =========================
    @DeleteMapping("/{groupId}")
    public ResponseEntity<String> deleteGroup(
            @PathVariable Long groupId,
            Authentication authentication) {

        service.deleteGroup(groupId, authentication.getName());
        return ResponseEntity.ok("Group deleted successfully");
    }

    // =========================
    // GET ADMIN JOIN REQUESTS
    // =========================
    @GetMapping("/admin/requests")
    public List<UserStudyGroup> getAdminJoinRequests() {
        return service.getPendingRequestsForAdmin();
    }

    // =========================
    // ADVANCED SEARCH
    // =========================
    @GetMapping("/search")
    public Page<GroupResponse> searchGroups(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String privacy,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Integer minMembers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        return service.searchGroups(keyword, privacy, courseId, minMembers, pageable);
    }

    // =========================
    // MY GROUPS
    // =========================
    @GetMapping("/my-groups")
    public List<GroupResponse> getMyGroups() {
        return service.getMyGroups();
    }

    // =========================
    // MY ADMIN GROUPS
    // =========================
    @GetMapping("/my-admin-groups")
    public List<GroupResponse> getMyAdminGroups() {
        return service.getMyAdminGroups();
    }

    // =========================
    // MY PENDING GROUP IDS
    // =========================
    @GetMapping("/my-pending-ids")
    public List<Long> getMyPendingGroupIds() {
        return service.getMyPendingGroupIds();
    }

    // =========================
    // GET GROUP MEMBERS
    // =========================
    @GetMapping("/{groupId}/members")
    public List<GroupMemberResponse> getMembers(@PathVariable Long groupId) {
        return service.getGroupMembers(groupId);
    }

    // ⚠️ KEEP THIS LAST
    @GetMapping("/{id}")
    public GroupResponse getGroup(@PathVariable Long id) {
        return service.getGroupById(id);
    }
}