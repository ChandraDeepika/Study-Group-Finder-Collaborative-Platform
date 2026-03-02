package com.studygroup.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.dto.GroupSearchRequest;
import com.studygroup.backend.dto.JoinRequestActionRequest;
import com.studygroup.backend.model.Course;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.model.enums.GroupPrivacy;
import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;
import com.studygroup.backend.repository.CourseRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;

@Service
public class StudyGroupService {

    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final UserStudyGroupRepository userStudyGroupRepo;
    private final CourseRepository courseRepo;

    public StudyGroupService(
            StudyGroupRepository groupRepo,
            UserRepository userRepo,
            UserStudyGroupRepository userStudyGroupRepo,
            CourseRepository courseRepo) {

        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.userStudyGroupRepo = userStudyGroupRepo;
        this.courseRepo = courseRepo;
    }

    // ── Helper ────────────────────────────────────────────────
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private GroupResponse toResponse(StudyGroup g) {
        return new GroupResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getCreatedBy().getEmail(),
                g.getPrivacy().name()
        );
    }

    // =========================
    // CREATE GROUP
    // =========================
    public GroupResponse createGroup(CreateGroupRequest request) {

        if (request.getName() == null || request.getName().isBlank())
            throw new RuntimeException("Group name is required");

        if (request.getPrivacy() == null || request.getPrivacy().isBlank())
            throw new RuntimeException("Group privacy is required");

        if (request.getCourseId() == null || request.getCourseId() <= 0)
            throw new RuntimeException("Course ID must be a positive number");

        GroupPrivacy privacy;
        try {
            privacy = GroupPrivacy.valueOf(request.getPrivacy().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid privacy type. Use PUBLIC or PRIVATE");
        }

        User creator = getCurrentUser();

        Course course = courseRepo.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        StudyGroup group = new StudyGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setPrivacy(privacy);
        group.setCreatedBy(creator);
        group.setCourse(course);

        StudyGroup savedGroup = groupRepo.save(group);

        UserStudyGroup creatorMembership = new UserStudyGroup();
        creatorMembership.setUser(creator);
        creatorMembership.setStudyGroup(savedGroup);
        creatorMembership.setRole(GroupRole.ADMIN);
        creatorMembership.setStatus(JoinStatus.APPROVED);

        userStudyGroupRepo.save(creatorMembership);

        return toResponse(savedGroup);
    }

    // =========================
    // JOIN GROUP
    // =========================
    public String joinGroup(Long groupId) {

        User user = getCurrentUser();

        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        var existing = userStudyGroupRepo.findByStudyGroupIdAndUserId(groupId, user.getId());

        if (existing.isPresent()) {
            if (existing.get().getStatus() == JoinStatus.APPROVED)
                return "You are already a member";
            if (existing.get().getStatus() == JoinStatus.PENDING)
                return "Join request already pending";
        }

        UserStudyGroup membership = new UserStudyGroup();
        membership.setUser(user);
        membership.setStudyGroup(group);
        membership.setRole(GroupRole.MEMBER);

        if (group.getPrivacy() == GroupPrivacy.PUBLIC) {
            membership.setStatus(JoinStatus.APPROVED);
            userStudyGroupRepo.save(membership);
            return "Joined successfully";
        }

        membership.setStatus(JoinStatus.PENDING);
        userStudyGroupRepo.save(membership);

        return "Join request sent to admin";
    }

    // =========================
    // SEARCH GROUPS (used by GET /api/groups)
    // =========================
    public List<GroupResponse> searchGroups(GroupSearchRequest request) {

        GroupPrivacy privacy = null;
        if (request.getPrivacy() != null && !request.getPrivacy().isBlank()) {
            privacy = GroupPrivacy.valueOf(request.getPrivacy().toUpperCase());
        }

        // Single optimized DB query instead of findAll + Java filter
        List<StudyGroup> groups = groupRepo.filterGroups(
                privacy,
                request.getCourseId(),
                request.getKeyword()
        );

        return groups.stream().map(this::toResponse).toList();
    }

    // =========================
    // FILTER GROUPS (with sorting + pagination)
    // =========================
    public List<GroupResponse> filterGroups(
            String keyword, String privacy, Long courseId,
            String sortBy, String sortDir, int page, int size) {

        GroupPrivacy privacyEnum = null;
        if (privacy != null && !privacy.isBlank()) {
            privacyEnum = GroupPrivacy.valueOf(privacy.toUpperCase());
        }

        String sortField = switch (sortBy != null ? sortBy : "id") {
            case "name" -> "name";
            case "createdAt" -> "createdAt";
            case "privacy" -> "privacy";
            default -> "id";
        };

        Sort sort = "asc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortField).ascending()
                : Sort.by(sortField).descending();

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<StudyGroup> results = groupRepo.filterGroupsPaged(
                privacyEnum, courseId, keyword, pageable);

        return results.stream().map(this::toResponse).toList();
    }

    // =========================
    // GET GROUP BY ID
    // =========================
    public GroupResponse getGroupById(Long id) {
        StudyGroup g = groupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return toResponse(g);
    }

    // =========================
    // GET JOINED GROUP IDS (optimized — single indexed query)
    // =========================
    public List<Long> getJoinedGroupIds() {
        User user = getCurrentUser();
        return userStudyGroupRepo.findByUserIdAndStatus(user.getId(), JoinStatus.APPROVED)
                .stream()
                .map(m -> m.getStudyGroup().getId())
                .toList();
    }

    // =========================
    // GET PENDING GROUP IDS (optimized — single indexed query)
    // =========================
    public List<Long> getPendingGroupIds() {
        User user = getCurrentUser();
        return userStudyGroupRepo.findByUserIdAndStatus(user.getId(), JoinStatus.PENDING)
                .stream()
                .map(m -> m.getStudyGroup().getId())
                .toList();
    }

    // =========================
    // GET MY GROUPS (optimized — JOIN FETCH, no N+1)
    // =========================
    public List<GroupResponse> getMyGroups() {
        User user = getCurrentUser();
        return userStudyGroupRepo.findByUserIdAndStatus(user.getId(), JoinStatus.APPROVED)
                .stream()
                .map(m -> toResponse(m.getStudyGroup()))
                .toList();
    }

    // =========================
    // GET MY ADMIN GROUPS (optimized — single indexed query)
    // =========================
    public List<GroupResponse> getMyAdminGroups() {
        User user = getCurrentUser();
        return userStudyGroupRepo.findByUserIdAndRoleAndStatus(
                        user.getId(), GroupRole.ADMIN, JoinStatus.APPROVED)
                .stream()
                .map(m -> toResponse(m.getStudyGroup()))
                .toList();
    }

    // =========================
    // APPROVE / REJECT JOIN REQUEST
    // =========================
    public void handleJoinRequest(Long groupId, Long adminId, JoinRequestActionRequest request) {

        UserStudyGroup adminMembership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new RuntimeException("Admin is not a group member"));

        if (adminMembership.getRole() != GroupRole.ADMIN)
            throw new RuntimeException("Only admin can approve join requests");

        UserStudyGroup memberMembership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, request.getUserId())
                .orElseThrow(() -> new RuntimeException("Join request not found"));

        if (request.isApprove()) {
            memberMembership.setStatus(JoinStatus.APPROVED);
            userStudyGroupRepo.save(memberMembership);
        } else {
            userStudyGroupRepo.delete(memberMembership);
        }
    }

    // =========================
    // GET GROUP MEMBERS (optimized — JOIN FETCH, no N+1)
    // =========================
    public List<GroupMemberResponse> getGroupMembers(Long groupId) {
        return userStudyGroupRepo.findByStudyGroupIdWithUser(groupId)
                .stream()
                .map(m -> {
                    User u = m.getUser();
                    return new GroupMemberResponse(
                            u.getId(),
                            u.getName(),
                            u.getEmail(),
                            u.getField(),
                            u.getEducationLevel(),
                            u.getLocation(),
                            u.getSkills(),
                            u.getProfileImage(),
                            m.getRole().name(),
                            m.getStatus().name()
                    );
                })
                .toList();
    }
}