package com.studygroup.backend.model;

import jakarta.persistence.*;
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

    private String name;
    private String email;
    private String password;
    private String role; //USER /ADMIN(future-proof)
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;

    private String avatarUrl;
}
