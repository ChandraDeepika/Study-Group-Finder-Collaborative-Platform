package com.studygroup.backend.service;

import com.studygroup.backend.dto.SessionRequest;
import com.studygroup.backend.dto.SessionResponse;
import com.studygroup.backend.exceptions.ResourceNotFoundException;
import com.studygroup.backend.model.Session;
import com.studygroup.backend.repository.SessionRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final NotificationService notificationService;
    private final StudyGroupService studyGroupService;

    // 🔥 CREATE SESSION
    @Transactional
    public SessionResponse createSession(SessionRequest request) {

        log.info("Creating session for groupId={} by userId={}",
                request.getGroupId(), request.getUserId());

        // 🔒 Authorization check
        validateUserInGroup(request.getUserId(), request.getGroupId());

        // ⏱ Validate future time (extra safety beyond DTO)
        if (request.getDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Session must be scheduled in the future");
        }

        Session session = Session.builder()
                .groupId(request.getGroupId())
                .title(request.getTitle())
                .description(request.getDescription())
                .dateTime(request.getDateTime())
                .createdBy(request.getUserId())
                .build();

        Session saved = sessionRepository.save(Objects.requireNonNull(session));

        log.info("Session created successfully with id={}", saved.getId());

        // 🔔 Trigger notifications (async-friendly)
        notificationService.notifyGroupMembers(saved);

        return mapToResponse(saved);
    }

    // 🔍 GET SESSIONS BY GROUP
    @Transactional(readOnly = true)
    public List<SessionResponse> getSessionsByGroup(Long groupId) {

        log.info("Fetching sessions for groupId={}", groupId);

        return sessionRepository.findByGroupId(groupId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 🔍 GET SESSION BY ID
    @Transactional(readOnly = true)
    public SessionResponse getSessionById(Long id) {

        log.info("Fetching session with id={}", id);

        Session session = sessionRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Session", "id", id
                ));

        return mapToResponse(session);
    }

    // ❌ DELETE SESSION
    @Transactional
    public void deleteSession(Long id) {

        log.warn("Deleting session with id={}", id);

        Session session = sessionRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Session", "id", id
                ));

        sessionRepository.delete(Objects.requireNonNull(session));

        log.info("Session deleted successfully with id={}", id);
    }

    // ⏰ UPCOMING SESSIONS (for scheduler)
    @Transactional(readOnly = true)
    public List<Session> getUpcomingSessions() {

        LocalDateTime now = LocalDateTime.now();

        log.debug("Fetching upcoming sessions after {}", now);

        return sessionRepository.findUpcomingSessions(now);
    }

    // 🔒 AUTH VALIDATION (Reusable)
    private void validateUserInGroup(Long userId, Long groupId) {
        if (!studyGroupService.isUserMemberOfGroup(userId, groupId)) {
            log.error("Unauthorized access: userId={} not in groupId={}", userId, groupId);
            throw new SecurityException("User not authorized for this group");
        }
    }

    // 🔄 ENTITY → DTO MAPPER
    private SessionResponse mapToResponse(Session session) {
        return SessionResponse.builder()
                .id(session.getId())
                .groupId(session.getGroupId())
                .title(session.getTitle())
                .description(session.getDescription())
                .dateTime(session.getDateTime())
                .createdBy(session.getCreatedBy())
                .isUpcoming(session.getDateTime().isAfter(LocalDateTime.now()))
                .createdAt(session.getCreatedAt() != null
                        ? session.getCreatedAt()
                        : LocalDateTime.now())
                .build();
    }
}