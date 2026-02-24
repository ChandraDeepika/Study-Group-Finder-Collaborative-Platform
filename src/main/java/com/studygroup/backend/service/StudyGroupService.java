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
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.model.enums.GroupPrivacy;
import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;

@Service
public class StudyGroupService {

    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final UserStudyGroupRepository userStudyGroupRepo;

    public StudyGroupService(
            StudyGroupRepository groupRepo,
            UserRepository userRepo,
            UserStudyGroupRepository userStudyGroupRepo) {

        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.userStudyGroupRepo = userStudyGroupRepo;
    }

    // =========================
    // CREATE GROUP
    // =========================
    public GroupResponse createGroup(CreateGroupRequest request) {

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Group name is required");
        }

        String privacyValue = request.getPrivacy();
        if (privacyValue == null || privacyValue.isBlank()) {
            throw new RuntimeException("Group privacy is required");
        }

        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        String email = auth.getName();

        User creator = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudyGroup group = new StudyGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setPrivacy(GroupPrivacy.valueOf(privacyValue));
        group.setCreatedBy(creator);

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
                creator.getEmail()
        );
    }

    // =========================
    // SEARCH GROUPS (BY PRIVACY)
    // =========================
    public List<StudyGroup> searchGroups(GroupSearchRequest request) {

        String privacy = request.getPrivacy(); // normalize once

        if (privacy != null && !privacy.isBlank()) {
            return groupRepo.findByPrivacy(
                    GroupPrivacy.valueOf(privacy)
            );
        }

        return groupRepo.findAll();
    }

    // =========================
    // APPROVE / REJECT JOIN REQUEST
    // =========================
    public void handleJoinRequest(
            Long groupId,
            Long adminId,
            JoinRequestActionRequest request) {

        final UserStudyGroup adminMembership =
                userStudyGroupRepo
                        .findByStudyGroupIdAndUserId(groupId, adminId)
                        .orElseThrow(() ->
                                new RuntimeException("Admin is not a group member"));

        if (adminMembership.getRole() != GroupRole.ADMIN) {
            throw new RuntimeException("Only admin can approve join requests");
        }

        final UserStudyGroup memberMembership =
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