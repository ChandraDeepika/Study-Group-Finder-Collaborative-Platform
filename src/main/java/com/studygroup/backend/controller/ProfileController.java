package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ProfileResponse;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Get logged-in user's profile using JWT (includes profileImage from registration)
    @GetMapping("/me")
    public ProfileResponse getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return ProfileResponse.from(user);
    }

    // ✅ Serve profile image (authenticated) - ensures correct path
    @GetMapping("/me/image")
    public ResponseEntity<Resource> getMyProfileImage(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        String fileName = user.getProfileImage();
        if (fileName == null || fileName.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        File file = new File("uploads", fileName);
        if (!file.exists() || !file.isFile()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String contentType = getContentType(fileName);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }

    private String getContentType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String ext = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")).toLowerCase() : "";
        return switch (ext) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}