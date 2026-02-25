package com.studygroup.backend.dto;

import com.studygroup.backend.model.User;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.nio.file.Files;
import java.nio.file.Path;

@Getter
@Setter
@NoArgsConstructor
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
