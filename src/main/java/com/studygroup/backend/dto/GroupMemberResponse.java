package com.studygroup.backend.dto;

public class GroupMemberResponse {

    private Long userId;
    private String userName;
    private String email;
    private String field;
    private String educationLevel;
    private String location;
    private String skills;
    private String profileImage;
    private String role;
    private String status;

    public GroupMemberResponse(Long userId, String userName, String email,
                                String field, String educationLevel,
                                String location, String skills,
                                String profileImage,
                                String role, String status) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.field = field;
        this.educationLevel = educationLevel;
        this.location = location;
        this.skills = skills;
        this.profileImage = profileImage;
        this.role = role;
        this.status = status;
    }

    public Long getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getEmail() { return email; }
    public String getField() { return field; }
    public String getEducationLevel() { return educationLevel; }
    public String getLocation() { return location; }
    public String getSkills() { return skills; }
    public String getProfileImage() { return profileImage; }
    public String getRole() { return role; }
    public String getStatus() { return status; }
}