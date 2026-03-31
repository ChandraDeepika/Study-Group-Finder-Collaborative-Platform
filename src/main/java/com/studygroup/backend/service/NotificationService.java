package com.studygroup.backend.service;

import com.studygroup.backend.exceptions.ResourceNotFoundException;
import com.studygroup.backend.model.Notification;
import com.studygroup.backend.model.Session;
import com.studygroup.backend.model.UserStudyGroup;
import com.studygroup.backend.model.enums.NotificationStatus;
import com.studygroup.backend.model.enums.NotificationType;
import com.studygroup.backend.repository.NotificationRepository;
import com.studygroup.backend.repository.UserStudyGroupRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserStudyGroupRepository userStudyGroupRepository;
    private final EmailService emailService;

    // 🔔 NOTIFY GROUP MEMBERS (CORE FEATURE)
    @Transactional
    public void notifyGroupMembers(Session session) {

        log.info("Sending notifications for sessionId={} groupId={}",
                session.getId(), session.getGroupId());

        // ✅ Get all approved members
        List<UserStudyGroup> members =
                userStudyGroupRepository.findByStudyGroupIdAndStatus(
                        session.getGroupId(),
                        com.studygroup.backend.model.enums.JoinStatus.APPROVED
                );

        for (UserStudyGroup member : members) {

            Long userId = member.getUser().getId();

            Notification notification = Notification.builder()
                    .userId(userId)
                    .type(NotificationType.REMINDER)
                    .message("New study session scheduled: " + session.getTitle())
                    .referenceId(session.getId())
                    .status(NotificationStatus.UNREAD)
                    .build();

            notificationRepository.save(Objects.requireNonNull(notification));

            // 🔥 Send Email (can be async later)
            emailService.sendSessionReminder(userId, session);
        }

        log.info("Notifications sent to {} users", members.size());
    }

    // 🔍 GET USER NOTIFICATIONS
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(Long userId) {

        log.info("Fetching notifications for userId={}", userId);

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 🔍 GET UNREAD COUNT (FOR 🔔 ICON)
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {

        return notificationRepository
                .countByUserIdAndStatus(userId, NotificationStatus.UNREAD);
    }

    // ✅ MARK SINGLE AS READ
    @Transactional
    public void markAsRead(Long id) {

        Notification notification = notificationRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Notification", "id", id
                ));

        notification.markAsRead();

        notificationRepository.save(notification);

        log.info("Notification marked as read id={}", id);
    }

    // ✅ MARK ALL AS READ
    @Transactional
    public void markAllAsRead(Long userId) {

        log.info("Marking all notifications as read for userId={}", userId);

        notificationRepository.markAllAsRead(userId);
    }

    // 🔥 CREATE CUSTOM NOTIFICATION (INVITES, SYSTEM)
    @Transactional
    public Notification createNotification(
            Long userId,
            NotificationType type,
            String message,
            Long referenceId
    ) {

        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .status(NotificationStatus.UNREAD)
                .build();

        Notification saved = notificationRepository.save(Objects.requireNonNull(notification));

        log.info("Notification created id={} for userId={}", saved.getId(), userId);

        return saved;
    }

    // ⏰ UPCOMING REMINDER TRIGGER (FOR SCHEDULER)
    @Transactional
    public void sendUpcomingReminders(List<Session> sessions) {

        log.info("Processing upcoming session reminders");

        for (Session session : sessions) {
            notifyGroupMembers(session);
        }
    }

    // 🧹 CLEANUP OLD NOTIFICATIONS
    @Transactional
    public void deleteOldNotifications(int days) {

        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);

        log.warn("Deleting notifications older than {}", cutoff);

        notificationRepository.deleteOldNotifications(cutoff);
    }
}