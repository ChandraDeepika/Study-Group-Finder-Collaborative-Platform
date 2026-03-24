package com.studygroup.backend.dto;

import jakarta.validation.constraints.*;

public class ProfileUpdateRequest {
    @NotBlank
    private String universityName;

    @Min(2000)
    @Max(2100)
    private Integer universityPassingYear;

    @DecimalMin("0.0")
    @DecimalMax("10.0")
    private Float universityPassingGPA;

    public String getUniversityName() {
        return universityName;
    }

    public void setUniversityName(String universityName) {
        this.universityName = universityName;
    }

    public Integer getUniversityPassingYear() {
        return universityPassingYear;
    }

    public void setUniversityPassingYear(Integer universityPassingYear) {
        this.universityPassingYear = universityPassingYear;
    }

    public Float getUniversityPassingGPA() {
        return universityPassingGPA;
    }

    public void setUniversityPassingGPA(Float universityPassingGPA) {
        this.universityPassingGPA = universityPassingGPA;
    }
}
