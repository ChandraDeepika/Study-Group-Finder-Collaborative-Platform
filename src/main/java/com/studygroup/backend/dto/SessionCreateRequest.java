package com.studygroup.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class SessionCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Start time required")
    @Future(message = "Start time must be in future")
    private LocalDateTime startTime;

    @NotNull(message = "End time required")
    private LocalDateTime endTime;

    @NotNull(message = "Group ID required")
    private Long groupId;

    // =========================
    // GETTERS & SETTERS
    // =========================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}