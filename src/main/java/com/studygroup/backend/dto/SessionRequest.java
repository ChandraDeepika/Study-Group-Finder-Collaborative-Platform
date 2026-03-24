package com.studygroup.backend.dto;

import java.time.LocalDateTime;

public class SessionRequest {
    private String title;
    private String description;
    private LocalDateTime sessionDate;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getSessionDate() { return sessionDate; }
    public void setSessionDate(LocalDateTime sessionDate) { this.sessionDate = sessionDate; }
}
