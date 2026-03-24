package com.studygroup.backend.dto;

import com.studygroup.backend.model.User;

import java.nio.file.Files;
import java.nio.file.Path;

public class ProfileResponse {

    private String name;
    private String email;
    private String location;
    private String educationLevel;
    private String field;
    private String skills;
    private String bio;
    private String profileImage;
    private String profileImageBase64;  // base64 data URL for direct display
    private String universityName;
    private Integer universityPassingYear;
    private Float universityPassingGPA;

    public ProfileResponse() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEducationLevel() {
        return educationLevel;
    }

    public void setEducationLevel(String educationLevel) {
        this.educationLevel = educationLevel;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getProfileImageBase64() {
        return profileImageBase64;
    }

    public void setProfileImageBase64(String profileImageBase64) {
        this.profileImageBase64 = profileImageBase64;
    }

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

    public static ProfileResponse from(User user) {
        ProfileResponse r = new ProfileResponse();
        r.setName(user.getName());
        r.setEmail(user.getEmail());
        r.setLocation(user.getLocation());
        r.setEducationLevel(user.getEducationLevel());
        r.setField(user.getField());
        r.setSkills(user.getSkills());
        r.setBio(user.getBio());
        r.setProfileImage(user.getProfileImage());
        // Load image as base64 for reliable display
        String imgName = user.getProfileImage();
        if (imgName != null && !imgName.isBlank()) {
            try {
                Path path = Path.of(System.getProperty("user.dir"), "uploads", imgName);
                if (Files.exists(path)) {
                    byte[] bytes = Files.readAllBytes(path);
                    String ext = imgName.contains(".") ? imgName.substring(imgName.lastIndexOf(".") + 1).toLowerCase() : "jpg";
                    String mime = switch (ext) {
                        case "png" -> "image/png";
                        case "gif" -> "image/gif";
                        case "webp" -> "image/webp";
                        default -> "image/jpeg";
                    };
                    r.setProfileImageBase64("data:" + mime + ";base64," + java.util.Base64.getEncoder().encodeToString(bytes));
                }
            } catch (Exception ignored) { }
        }
        r.setUniversityName(user.getUniversityName());
        r.setUniversityPassingYear(user.getUniversityPassingYear());
        r.setUniversityPassingGPA(user.getUniversityPassingGPA());
        return r;
    }
}
