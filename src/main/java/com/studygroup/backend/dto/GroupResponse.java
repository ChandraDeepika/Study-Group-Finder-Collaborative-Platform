package com.studygroup.backend.dto;

public class GroupResponse {

private Long id;

private String name;

private String description;

private String adminEmail;

private String privacy;   // ✅ ADDED



public GroupResponse(Long id,

                     String name,

                     String description,

                     String adminEmail,

                     String privacy) {



    this.id = id;

    this.name = name;

    this.description = description;

    this.adminEmail = adminEmail;

    this.privacy = privacy;

}



public Long getId() { return id; }

public String getName() { return name; }

public String getDescription() { return description; }

public String getAdminEmail() { return adminEmail; }

public String getPrivacy() { return privacy; }   // ✅ ADDED

}