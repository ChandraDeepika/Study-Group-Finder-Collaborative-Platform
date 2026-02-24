package com.studygroup.backend.dto;

public class GroupMemberResponse {

    private Long userId;
    private String userName;
    private String role;
    private String status;

    public GroupMemberResponse(Long userId, String userName, String role, String status) {
        this.userId = userId;
        this.userName = userName;
        this.role = role;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }
}
