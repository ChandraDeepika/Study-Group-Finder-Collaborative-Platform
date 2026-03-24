package com.studygroup.backend.service;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.dto.SessionCreateRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.model.Session;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.SessionRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;

@Service
public class SessionService {

    private final SessionRepository sessionRepo;
    private final StudyGroupRepository groupRepo;
    private final UserRepository userRepo;
    private final UserStudyGroupRepository userStudyGroupRepo;

    public SessionService(SessionRepository sessionRepo,
                          StudyGroupRepository groupRepo,
                          UserRepository userRepo,
                          UserStudyGroupRepository userStudyGroupRepo) {
        this.sessionRepo = sessionRepo;
        this.groupRepo = groupRepo;
        this.userRepo = userRepo;
        this.userStudyGroupRepo = userStudyGroupRepo;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ CREATE SESSION
    public SessionResponse createSession(SessionCreateRequest request) {

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        User user = getCurrentUser();

        StudyGroup group = groupRepo.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        // ✅ CHECK USER IS MEMBER
        boolean isMember = userStudyGroupRepo
                .findByStudyGroupIdAndUserId(group.getId(), user.getId())
                .map(m -> m.getStatus().name().equals("APPROVED"))
                .orElse(false);

        if (!isMember) {
            throw new RuntimeException("You are not a member of this group");
        }

        Session session = new Session();
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setStudyGroup(group);
        session.setCreatedBy(user);

        Session saved = sessionRepo.save(session);

        return new SessionResponse(
                saved.getId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getStartTime(),
                saved.getEndTime(),
                group.getId(),
                user.getEmail()
        );
    }

    // ✅ GET GROUP SESSIONS
    public List<SessionResponse> getSessionsByGroup(Long groupId) {

        return sessionRepo.findByStudyGroupId(groupId)
                .stream()
                .map(s -> new SessionResponse(
                        s.getId(),
                        s.getTitle(),
                        s.getDescription(),
                        s.getStartTime(),
                        s.getEndTime(),
                        s.getStudyGroup().getId(),
                        s.getCreatedBy().getEmail()
                ))
                .toList();
    }
}