package com.studygroup.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupMemberResponse;
import com.studygroup.backend.dto.GroupResponse;
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
import com.studygroup.backend.specification.StudyGroupSpecification;

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

    // =========================
    // HELPER
    // =========================
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private GroupResponse toResponse(StudyGroup g) {

    User currentUser = getCurrentUser();

    var membership = userStudyGroupRepo
            .findByStudyGroupIdAndUserId(g.getId(), currentUser.getId());

    JoinStatus joinStatus = null;
    GroupRole role = null;

    if (membership.isPresent()) {
        joinStatus = membership.get().getStatus();
        role = membership.get().getRole();
    }
            return new GroupResponse(
            g.getId(),
            g.getName(),
            g.getDescription(),
            g.getCreatedBy().getEmail(),
            g.getPrivacy().name(),
            joinStatus,
            role
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
            throw new RuntimeException("Valid Course ID required");

        GroupPrivacy privacy;
        try {
            privacy = GroupPrivacy.valueOf(request.getPrivacy().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Privacy must be PUBLIC or PRIVATE");
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

        UserStudyGroup membership = new UserStudyGroup();
        membership.setUser(creator);
        membership.setStudyGroup(savedGroup);
        membership.setRole(GroupRole.ADMIN);
        membership.setStatus(JoinStatus.APPROVED);

        userStudyGroupRepo.save(membership);

        return toResponse(savedGroup);
    }

    // =========================
    // JOIN GROUP
    // =========================
    public String joinGroup(Long groupId) {

        User user = getCurrentUser();

        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        var existing = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, user.getId());

        if (existing.isPresent()) {
            if (existing.get().getStatus() == JoinStatus.APPROVED)
                return "Already a member";
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
        return "Join request sent";
    }

    // =========================
    // ADVANCED SEARCH (Specification Based)
    // =========================
    public Page<GroupResponse> searchGroups(
            String keyword,
            String privacy,
            Long courseId,
            Integer minMembers,
            Pageable pageable
    ) {

        GroupPrivacy privacyEnum = null;
        if (privacy != null && !privacy.isBlank()) {
            privacyEnum = GroupPrivacy.valueOf(privacy.toUpperCase());
        }

        Specification<StudyGroup> spec =
                StudyGroupSpecification.filter(
                        keyword,
                        privacyEnum,
                        courseId,
                        minMembers
                );

        Page<StudyGroup> results = groupRepo.findAll(spec, pageable);

        return results.map(this::toResponse);
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
    // GET MY GROUPS
    // =========================
    public List<GroupResponse> getMyGroups() {
        User user = getCurrentUser();
        return userStudyGroupRepo
                .findByUserIdAndStatus(user.getId(), JoinStatus.APPROVED)
                .stream()
                .map(m -> toResponse(m.getStudyGroup()))
                .toList();
    }

    // =========================
    // GET MY ADMIN GROUPS
    // =========================
    public List<GroupResponse> getMyAdminGroups() {

        User user = getCurrentUser();

        return userStudyGroupRepo
                .findByUserIdAndRoleAndStatus(
                        user.getId(),
                        GroupRole.ADMIN,
                        JoinStatus.APPROVED
                )
                .stream()
                .map(m -> toResponse(m.getStudyGroup()))
                .toList();
    }
    // =========================
// GET MY PENDING GROUP IDS
// =========================
public List<Long> getMyPendingGroupIds() {

    User user = getCurrentUser();

    return userStudyGroupRepo
            .findByUserIdAndStatus(user.getId(), JoinStatus.PENDING)
            .stream()
            .map(m -> m.getStudyGroup().getId())
            .toList();
}

    // =========================
    // APPROVE / REJECT JOIN
    // =========================
    public void handleJoinRequest(
            Long groupId,
            Long adminId,
            JoinRequestActionRequest request) {

        UserStudyGroup admin = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, adminId)
                .orElseThrow(() -> new RuntimeException("Not a member"));

        if (admin.getRole() != GroupRole.ADMIN)
            throw new RuntimeException("Only admin can approve");

        UserStudyGroup member = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, request.getUserId())
                .orElseThrow(() -> new RuntimeException("Join request not found"));

        if (request.isApprove()) {
            member.setStatus(JoinStatus.APPROVED);
            userStudyGroupRepo.save(member);
        } else {
            userStudyGroupRepo.delete(member);
        }
    }

    // =========================
    // GET GROUP MEMBERS
    // =========================
    public List<GroupMemberResponse> getGroupMembers(Long groupId) {
        return userStudyGroupRepo
                .findByStudyGroupIdWithUser(groupId)
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