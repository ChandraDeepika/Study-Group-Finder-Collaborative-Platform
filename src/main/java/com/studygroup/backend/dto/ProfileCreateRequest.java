package com.studygroup.backend.dto;

public class ProfileCreateRequest{
    private String universityName;
    private Integer universityPassingYear;
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