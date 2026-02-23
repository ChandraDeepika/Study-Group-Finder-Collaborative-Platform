package com.studygroup.backend.controller;

import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // ✅ Get logged-in user's profile using JWT
    @GetMapping("/me")
    public User getMyProfile(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }
}