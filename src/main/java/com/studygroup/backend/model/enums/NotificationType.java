package com.studygroup.backend.model.enums;

public enum NotificationType {

    REMINDER("Session reminder"),
    INVITATION("Group invitation"),
    JOIN_REQUEST("Join request received"),
    JOIN_APPROVED("Join request approved"),
    JOIN_REJECTED("Join request rejected"),
    NEW_MESSAGE("New chat message"),
    GROUP_UPDATE("Group details updated"),
    MEMBER_LEFT("Member left group"),
    SESSION_CANCELLED("Session cancelled");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
