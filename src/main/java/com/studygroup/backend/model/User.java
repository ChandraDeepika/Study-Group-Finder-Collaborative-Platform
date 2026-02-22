package com.studygroup.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    // Studygroup extra fields
    private String role; // USER / ADMIN
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;
    private String avatarUrl;

    // Optional: default role
    @PrePersist
    public void setDefaultRole() {
        if (role == null || role.isEmpty()) {
            role = "USER";
        }
    }
}
