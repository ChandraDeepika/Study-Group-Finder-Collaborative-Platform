package com.studygroup.backend.dto;

public class LoginResponse {

    private String token;
    private Long id;
    private String email;
    private String name;

    public LoginResponse(String token, Long id, String email, String name) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.name = name;
    }

    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
}
