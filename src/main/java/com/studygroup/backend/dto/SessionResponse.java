package com.studygroup.backend.dto;

import java.time.LocalDateTime;

public class SessionResponse {

    private Long id;
    private Long groupId;
    private String groupName;
    private String title;
    private String description;
    private LocalDateTime sessionDate;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public SessionResponse(Long id, Long groupId, String groupName, String title,
                           String description, LocalDateTime sessionDate,
                           Long createdById, String createdByName, LocalDateTime createdAt) {
        this.id = id;
        this.groupId = groupId;
        this.groupName = groupName;
        this.title = title;
        this.description = description;
        this.sessionDate = sessionDate;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getGroupId() { return groupId; }
    public String getGroupName() { return groupName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getSessionDate() { return sessionDate; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByName() { return createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}