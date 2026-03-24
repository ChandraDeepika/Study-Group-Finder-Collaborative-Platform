package com.studygroup.backend.dto;

import java.time.LocalDateTime;

public class SessionResponse {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long groupId;
    private String createdBy;

    public SessionResponse(Long id, String title, String description,
                           LocalDateTime startTime, LocalDateTime endTime,
                           Long groupId, String createdBy) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startTime = startTime;
        this.endTime = endTime;
        this.groupId = groupId;
        this.createdBy = createdBy;
    }

    // getters
}