package com.studygroup.backend.controller;

import com.studygroup.backend.model.Notification;
import com.studygroup.backend.service.NotificationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notification APIs", description = "Manage user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // 🔔 GET ALL NOTIFICATIONS (WITH PAGINATION)
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all notifications for a user")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("API request: Get notifications for userId={}, page={}, size={}",
                userId, page, size);

        // 🔥 You can upgrade service later to support pageable
        List<Notification> notifications =
                notificationService.getUserNotifications(userId);

        return ResponseEntity.ok(notifications);
    }

    // 🔔 GET UNREAD COUNT (FOR NOTIFICATION BELL)
    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {

        log.info("API request: Get unread count for userId={}", userId);

        long count = notificationService.getUnreadCount(userId);

        return ResponseEntity.ok(count);
    }

    // ✅ MARK SINGLE AS READ
    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<String> markAsRead(@PathVariable Long id) {

        log.info("API request: Mark notification as read id={}", id);

        notificationService.markAsRead(id);

        return ResponseEntity.ok("Notification marked as read");
    }

    // ✅ MARK ALL AS READ
    @PutMapping("/user/{userId}/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<String> markAllAsRead(@PathVariable Long userId) {

        log.info("API request: Mark all notifications as read for userId={}", userId);

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok("All notifications marked as read");
    }

    // ❌ DELETE OLD NOTIFICATIONS (ADMIN / CLEANUP)
    @DeleteMapping("/cleanup")
    @Operation(summary = "Delete old notifications (cleanup)")
    public ResponseEntity<String> deleteOldNotifications(
            @RequestParam(defaultValue = "30") int days) {

        log.warn("API request: Delete notifications older than {} days", days);

        notificationService.deleteOldNotifications(days);

        return ResponseEntity.status(HttpStatus.OK)
                .body("Old notifications deleted successfully");
    }
}