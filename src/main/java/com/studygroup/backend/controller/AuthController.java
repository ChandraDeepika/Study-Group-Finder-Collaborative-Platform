package com.studygroup.backend.controller;
import com.studygroup.backend.model.User;
import com.studygroup.backend.service.AuthService;
import com.studygroup.backend.dto.LoginRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ test endpoint
    @GetMapping("/ping")
    public String ping() {
        return "AUTH WORKING";
    }

   @PostMapping(value = "/register", consumes = "multipart/form-data")
public String register(
        @RequestPart("name") String name,
        @RequestPart("email") String email,
        @RequestPart("password") String password,
        @RequestPart(value = "location", required = false) String location,
        @RequestPart(value = "educationLevel", required = false) String educationLevel,
        @RequestPart(value = "field", required = false) String field,
        @RequestPart(value = "skills", required = false) String skills,
        @RequestPart(value = "bio", required = false) String bio,
        @RequestPart(value = "image", required = false) MultipartFile image
) {

    return authService.registerWithProfile(
            name,
            email,
            password,
            location,
            educationLevel,
            field,
            skills,
            bio,
            image
    );
}
    // ✅ login with JSON body (BEST practice for frontend)
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        System.out.println("LOGIN API HIT");

        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }

    // ✅ protected endpoint (JWT should allow only authenticated users)
    @GetMapping("/profile")
    public String profile() {
        return "This is a protected profile";
    }
}
