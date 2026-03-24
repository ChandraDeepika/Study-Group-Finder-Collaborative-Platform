package com.studygroup.backend.dto;

public class JoinRequestActionRequest {
    private Long userId;
    private boolean approve;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isApprove() {
        return approve;
    }

    public void setApprove(boolean approve) {
        this.approve = approve;
    }
}
