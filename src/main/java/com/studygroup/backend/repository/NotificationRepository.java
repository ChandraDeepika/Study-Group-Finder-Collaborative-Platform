package com.studygroup.backend.repository;

import com.studygroup.backend.model.Notification;
import com.studygroup.backend.model.enums.NotificationStatus;
import com.studygroup.backend.model.enums.NotificationType;
import com.studygroup.backend.repository.projection.NotificationSummary;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 🔹 GET ALL NOTIFICATIONS FOR USER (MOST RECENT FIRST)
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 🔹 PAGINATED NOTIFICATIONS (MOST RECENT FIRST)
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // 🔹 UNREAD NOTIFICATIONS
    List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);

    // 🔹 COUNT UNREAD (for notification bell 🔔)
    long countByUserIdAndStatus(Long userId, NotificationStatus status);

    // 🔹 FILTER BY TYPE (REMINDER / INVITATION)
    List<Notification> findByUserIdAndType(Long userId, NotificationType type);

    // 🔹 RECENT NOTIFICATIONS (LAST N HOURS)
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentNotifications(
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since
    );

    // 🔹 UPCOMING SESSION REMINDERS
    @Query("SELECT n FROM Notification n WHERE n.type = 'REMINDER' AND n.status = 'UNREAD'")
    List<Notification> findPendingReminders();

    // 🔹 MARK SINGLE AS READ
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);

    // 🔹 MARK ALL USER NOTIFICATIONS AS READ
    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.status = 'READ' WHERE n.userId = :userId")
    void markAllAsRead(@Param("userId") Long userId);

    // 🔹 DELETE OLD NOTIFICATIONS (CLEANUP JOB)
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoff")
    void deleteOldNotifications(@Param("cutoff") LocalDateTime cutoff);

    // 🔹 LIGHTWEIGHT PROJECTION (PERFORMANCE)
    @Query("SELECT n.id as id, n.type as type, n.status as status, n.createdAt as createdAt " +
           "FROM Notification n WHERE n.userId = :userId")
    List<NotificationSummary> findNotificationSummaries(@Param("userId") Long userId);
}