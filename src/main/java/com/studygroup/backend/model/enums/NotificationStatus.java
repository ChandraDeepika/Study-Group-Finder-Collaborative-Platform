package com.studygroup.backend.model.enums;

public enum NotificationStatus {

    UNREAD("Unread"),
    READ("Read"),
    ARCHIVED("Archived");

    private final String displayName;

    NotificationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isRead() {
        return this == READ || this == ARCHIVED;
    }
}
