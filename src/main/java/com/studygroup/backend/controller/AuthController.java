package com.studygroup.backend.controller;

import com.studygroup.backend.model.User;
import com.studygroup.backend.service.AuthService;
import com.studygroup.backend.dto.LoginRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    // ✅ register user
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authService.register(user);
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
