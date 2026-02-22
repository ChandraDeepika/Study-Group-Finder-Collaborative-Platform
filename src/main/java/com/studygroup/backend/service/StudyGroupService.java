package com.studygroup.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.dto.CreateGroupRequest;
import com.studygroup.backend.dto.GroupResponse;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;

@Service
public class StudyGroupService {

    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;

    public StudyGroupService(StudyGroupRepository groupRepo, UserRepository userRepo) {
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
    }

   public GroupResponse createGroup(CreateGroupRequest request) {

    // ✅ ADD VALIDATION HERE (first thing in method)
    if (request.getName() == null || request.getName().isBlank()) {
        throw new RuntimeException("Group name required");
    }

    Authentication auth = SecurityContextHolder
            .getContext()
            .getAuthentication();

    String email = auth.getName();

    User creator = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    StudyGroup group = new StudyGroup();
    group.setName(request.getName());
    group.setDescription(request.getDescription());
    group.setCreatedBy(creator);

    StudyGroup saved = groupRepo.save(group);

    return new GroupResponse(
            saved.getId(),
            saved.getName(),
            saved.getDescription(),
            creator.getEmail()
    );
}
}