package com.studygroup.backend.dto;

public class CreateGroupRequest {

    private String name;
    private String description;
    private String privacy; // PUBLIC / PRIVATE
    private Long courseId;

    // getters
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getPrivacy() {
        return privacy;
    }

    public Long getCourseId() {
        return courseId;
    }

    // setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrivacy(String privacy) {
        this.privacy = privacy;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}