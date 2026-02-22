package com.studygroup.backend.dto;

public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String adminEmail;

    public GroupResponse(Long id, String name, String description, String adminEmail) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.adminEmail = adminEmail;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getAdminEmail() { return adminEmail; }
}