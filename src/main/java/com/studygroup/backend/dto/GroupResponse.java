package com.studygroup.backend.dto;

import com.studygroup.backend.model.enums.GroupRole;
import com.studygroup.backend.model.enums.JoinStatus;

public class GroupResponse {

    private Long id;
    private String name;
    private String description;
    private String adminEmail;
    private String privacy;
    private JoinStatus joinStatus;
    private GroupRole role;

    public GroupResponse(Long id,
                         String name,
                         String description,
                         String adminEmail,
                         String privacy,
                         JoinStatus joinStatus,
                         GroupRole role) {

        this.id = id;
        this.name = name;
        this.description = description;
        this.adminEmail = adminEmail;
        this.privacy = privacy;
        this.joinStatus = joinStatus;
        this.role = role;
    }

    public Long getId() { return id; }

    public String getName() { return name; }

    public String getDescription() { return description; }

    public String getAdminEmail() { return adminEmail; }

    public String getPrivacy() { return privacy; }

    public JoinStatus getJoinStatus() { return joinStatus; }

    public GroupRole getRole() { return role; }
}