package com.studygroup.backend.service;

import com.studygroup.backend.dto.SessionRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.model.Session;
import com.studygroup.backend.model.StudyGroup;
import com.studygroup.backend.model.User;
import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;
import com.studygroup.backend.repository.SessionRepository;
import com.studygroup.backend.repository.StudyGroupRepository;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepo.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private void requireMembership(Long groupId, Long userId) {
        userStudyGroupRepo.findByStudyGroupIdAndUserId(groupId, userId)
                .filter(m -> m.getStatus() == JoinStatus.APPROVED)
                .orElseThrow(() -> new RuntimeException("You are not an approved member of this group"));
    }

    private SessionResponse toResponse(Session s) {
        return new SessionResponse(
                s.getId(),
                s.getGroup().getId(),
                s.getGroup().getName(),
                s.getTitle(),
                s.getDescription(),
                s.getSessionDate(),
                s.getCreatedBy().getId(),
                s.getCreatedBy().getName(),
                s.getCreatedAt()
        );
    }

    public SessionResponse createSession(Long groupId, SessionRequest req) {
        User user = getCurrentUser();
        requireMembership(groupId, user.getId());

        if (req.getTitle() == null || req.getTitle().isBlank())
            throw new RuntimeException("Session title is required");
        if (req.getSessionDate() == null)
            throw new RuntimeException("Session date is required");

        StudyGroup group = groupRepo.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Session session = new Session();
        session.setGroup(group);
        session.setTitle(req.getTitle().trim());
        session.setDescription(req.getDescription());
        session.setSessionDate(req.getSessionDate());
        session.setCreatedBy(user);

        return toResponse(sessionRepo.save(session));
    }

    public List<SessionResponse> getGroupSessions(Long groupId) {
        User user = getCurrentUser();
        requireMembership(groupId, user.getId());
        return sessionRepo.findByGroupIdOrderBySessionDateAsc(groupId)
                .stream().map(this::toResponse).toList();
    }

    public List<SessionResponse> getUpcomingSessions(Long groupId) {
        User user = getCurrentUser();
        requireMembership(groupId, user.getId());
        return sessionRepo.findUpcomingByGroupId(groupId, LocalDateTime.now())
                .stream().map(this::toResponse).toList();
    }

    public void deleteSession(Long groupId, Long sessionId) {
        User user = getCurrentUser();

        Session session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getGroup().getId().equals(groupId))
            throw new RuntimeException("Session does not belong to this group");

        boolean isCreator = session.getCreatedBy().getId().equals(user.getId());
        boolean isAdmin = userStudyGroupRepo.findByStudyGroupIdAndUserId(groupId, user.getId())
                .map(m -> m.getRole() == GroupRole.ADMIN)
                .orElse(false);

        if (!isCreator && !isAdmin)
            throw new RuntimeException("Only creator or admin can delete");

        sessionRepo.delete(session);
    }
}