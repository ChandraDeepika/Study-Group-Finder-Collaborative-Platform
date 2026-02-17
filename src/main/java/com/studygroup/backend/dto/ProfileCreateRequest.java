package com.studygroup.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileCreateRequest{
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;
    
}