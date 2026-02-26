package com.studygroup.backend.service;

import java.util.List;

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

    // =========================
    // CREATE GROUP
    // =========================
    public GroupResponse createGroup(CreateGroupRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Group name is required");
        }

        if (request.getPrivacy() == null || request.getPrivacy().isBlank()) {
            throw new RuntimeException("Group privacy is required");
        }

        if (request.getCourseId() == null) {
            throw new RuntimeException("Course is required");
        }

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Course course = courseRepo.findById(request.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));

        StudyGroup group = new StudyGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setPrivacy(GroupPrivacy.valueOf(request.getPrivacy()));
        group.setCreatedBy(creator);
        group.setCourse(course);

        StudyGroup savedGroup = groupRepo.save(group);

        // Creator becomes ADMIN
        UserStudyGroup creatorMembership = new UserStudyGroup();
        creatorMembership.setUser(creator);
        creatorMembership.setStudyGroup(savedGroup);
        creatorMembership.setRole(GroupRole.ADMIN);
        creatorMembership.setStatus(JoinStatus.APPROVED);

        userStudyGroupRepo.save(creatorMembership);

        return new GroupResponse(
                savedGroup.getId(),
                savedGroup.getName(),
                savedGroup.getDescription(),
                creator.getEmail(),
                savedGroup.getPrivacy().name()   // ✅ ADDED
        );
    }

    // =========================
    // JOIN GROUP
    // =========================
    public String joinGroup(Long groupId) {

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        var existing =
                userStudyGroupRepo.findByStudyGroupIdAndUserId(groupId, user.getId());

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
    // LIST ALL GROUPS
    // =========================
    public List<GroupResponse> searchGroups(GroupSearchRequest request) {

        List<StudyGroup> groups;

        if (request.getPrivacy() != null && !request.getPrivacy().isBlank()) {
            groups = groupRepo.findByPrivacy(
                    GroupPrivacy.valueOf(request.getPrivacy()));
        } else {
            groups = groupRepo.findAll();
        }

        return groups.stream()
                .map(g -> new GroupResponse(
                        g.getId(),
                        g.getName(),
                        g.getDescription(),
                        g.getCreatedBy().getEmail(),
                        g.getPrivacy().name()   // ✅ ADDED
                ))
                .toList();
    }

    // =========================
    // GET GROUP BY ID
    // =========================
    public GroupResponse getGroupById(Long id) {

        StudyGroup g = groupRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return new GroupResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getCreatedBy().getEmail(),
                g.getPrivacy().name()   // ✅ ADDED
        );
    }

    // =========================
    // APPROVE / REJECT JOIN REQUEST
    // =========================
    public void handleJoinRequest(
            Long groupId,
            Long adminId,
            JoinRequestActionRequest request) {

        UserStudyGroup adminMembership =
                userStudyGroupRepo
                        .findByStudyGroupIdAndUserId(groupId, adminId)
                        .orElseThrow(() ->
                                new RuntimeException("Admin is not a group member"));

        if (adminMembership.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admin can approve join requests");
        }

        UserStudyGroup memberMembership =
                userStudyGroupRepo
                        .findByStudyGroupIdAndUserId(groupId, request.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException("Join request not found"));

        if (request.isApprove()) {
            memberMembership.setStatus(JoinStatus.APPROVED);
            userStudyGroupRepo.save(memberMembership);
        } else {
            userStudyGroupRepo.delete(memberMembership);
        }
    }

    // =========================
    // GET GROUP MEMBERS
    // =========================
    public List<GroupMemberResponse> getGroupMembers(Long groupId) {

        return userStudyGroupRepo
                .findByStudyGroupId(groupId)
                .stream()
                .map(m -> new GroupMemberResponse(
                        m.getUser().getId(),
                        m.getUser().getName(),
                        m.getRole().name(),
                        m.getStatus().name()
                ))
                .toList();
    }
}