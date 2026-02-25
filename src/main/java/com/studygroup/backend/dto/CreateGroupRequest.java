package com.studygroup.backend.dto;

public class CreateGroupRequest {

    private String name;
    private String description;
    private String privacy; // PUBLIC / PRIVATE

    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getPrivacy() { return privacy; }

    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }
}