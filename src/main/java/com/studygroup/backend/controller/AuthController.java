package com.studygroup.backend.controller;
import com.studygroup.backend.dto.LoginRequest;
import com.studygroup.backend.dto.LoginResponse;
import com.studygroup.backend.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<String> register(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "educationLevel", required = false) String educationLevel,
            @RequestParam(value = "field", required = false) String field,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        String result = authService.registerWithProfile(
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
        if ("User registered successfully".equals(result)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
    // ✅ login with JSON body (BEST practice for frontend)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(msg);
        }
    }

    // ✅ protected endpoint (JWT should allow only authenticated users)
    @GetMapping("/profile")
    public String profile() {
        return "This is a protected profile";
    }
}
