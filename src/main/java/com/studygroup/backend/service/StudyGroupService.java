package com.studygroup.backend.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private static final Logger logger = LoggerFactory.getLogger(StudyGroupService.class);

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

    @Transactional(readOnly = true)
    public boolean isUserMemberOfGroup(Long userId, Long groupId) {

        if (userId == null || groupId == null) {
            throw new IllegalArgumentException("UserId and GroupId must not be null");
        }

        boolean isMember = userStudyGroupRepo
                .existsByUserIdAndStudyGroupIdAndStatus(
                        userId,
                        groupId,
                        JoinStatus.APPROVED
                );

        logger.debug("Membership validation userId={} groupId={} result={}",
                userId, groupId, isMember);

        return isMember;
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

        int memberCount = userStudyGroupRepo
                .countByStudyGroupIdAndStatus(g.getId(), JoinStatus.APPROVED);

        String courseName =
                g.getCourse() != null ? g.getCourse().getCourseName() : null;

        return new GroupResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getCreatedBy().getEmail(),
                g.getPrivacy().name(),
                joinStatus,
                role,
                memberCount,
                courseName
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

        GroupPrivacy privacy = GroupPrivacy.valueOf(request.getPrivacy().toUpperCase());

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
    // LEAVE GROUP
    // =========================
    public void leaveGroup(Long groupId, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStudyGroup membership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (membership.getRole() == GroupRole.ADMIN)
            throw new RuntimeException("Admin cannot leave the group");

        userStudyGroupRepo.delete(membership);
    }

    // =========================
    // HANDLE JOIN REQUEST
    // =========================
    public void handleJoinRequest(Long groupId, Long adminId, JoinRequestActionRequest request) {

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
    // TRANSFER ADMIN ROLE
    // =========================
    public void transferAdmin(Long groupId, Long newAdminUserId, String currentAdminEmail) {

        User currentAdmin = userRepo.findByEmail(currentAdminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStudyGroup currentAdminMembership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, currentAdmin.getId())
                .orElseThrow(() -> new RuntimeException("You are not a member"));

        if (currentAdminMembership.getRole() != GroupRole.ADMIN)
            throw new RuntimeException("Only admin can transfer admin role");

        UserStudyGroup newAdminMembership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, newAdminUserId)
                .orElseThrow(() -> new RuntimeException("New admin must be member"));

        currentAdminMembership.setRole(GroupRole.MEMBER);
        newAdminMembership.setRole(GroupRole.ADMIN);

        userStudyGroupRepo.save(currentAdminMembership);
        userStudyGroupRepo.save(newAdminMembership);
    }

    // =========================
    // DELETE GROUP
    // =========================
    public void deleteGroup(Long groupId, String adminEmail) {

        User admin = userRepo.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStudyGroup adminMembership = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(groupId, admin.getId())
                .orElseThrow(() -> new RuntimeException("Not a member"));

        if (adminMembership.getRole() != GroupRole.ADMIN)
            throw new RuntimeException("Only admin can delete the group");

        userStudyGroupRepo.deleteAllByStudyGroupId(groupId);
        groupRepo.deleteById(groupId);
    }

    // =========================
    // SEARCH GROUPS
    // =========================
    public Page<GroupResponse> searchGroups(
            String keyword,
            String privacy,
            Long courseId,
            Integer minMembers,
            Pageable pageable) {

        GroupPrivacy privacyEnum = null;

        if (privacy != null && !privacy.isBlank()) {
            privacyEnum = GroupPrivacy.valueOf(privacy.toUpperCase());
        }

        Specification<StudyGroup> spec =
                StudyGroupSpecification.filter(keyword, privacyEnum, courseId, minMembers);

        return groupRepo.findAll(spec, pageable).map(this::toResponse);
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
    // MY GROUPS
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
    // MY ADMIN GROUPS
    // =========================
    public List<GroupResponse> getMyAdminGroups() {

        User user = getCurrentUser();

        return userStudyGroupRepo
                .findByUserIdAndRoleAndStatus(user.getId(), GroupRole.ADMIN, JoinStatus.APPROVED)
                .stream()
                .map(m -> toResponse(m.getStudyGroup()))
                .toList();
    }

    // =========================
    // MY PENDING GROUP IDS
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
    // ADMIN PENDING REQUESTS
    // =========================
    public List<UserStudyGroup> getPendingRequestsForAdmin() {

        User admin = getCurrentUser();

        return userStudyGroupRepo.findPendingRequestsForAdmin(admin.getId());
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

    // =========================
    // REMOVE MEMBER (admin only)
    // =========================
    public void removeMember(Long groupId, Long userId, String adminEmail) {

        User admin = userRepo.findByEmail(adminEmail)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        UserStudyGroup adminMembership = userStudyGroupRepo
            .findByStudyGroupIdAndUserId(groupId, admin.getId())
            .orElseThrow(() -> new RuntimeException("You are not a member of this group"));

        if (adminMembership.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admin can remove members");
        }

        if (admin.getId().equals(userId)) {
            throw new RuntimeException("Admin cannot remove themselves");
        }

        UserStudyGroup memberMembership = userStudyGroupRepo
            .findByStudyGroupIdAndUserId(groupId, userId)
            .orElseThrow(() -> new RuntimeException("Member not found in this group"));

        userStudyGroupRepo.delete(memberMembership);

        logger.info("Member removed: userId={} from groupId={} by admin={}",
            userId, groupId, adminEmail);
    }
}