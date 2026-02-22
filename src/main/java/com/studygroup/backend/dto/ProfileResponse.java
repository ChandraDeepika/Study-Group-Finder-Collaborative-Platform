package com.studygroup.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileResponse {

    private String name;
    private String email;
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;
    private String avatarUrl;
}
