
package com.studygroup.backend.controller;

import com.studygroup.backend.dto.ProfileCreateRequest;
import com.studygroup.backend.dto.ProfileUpdateRequest;
import com.studygroup.backend.model.User;
import com.studygroup.backend.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }
    
    //GET PROFILE
    @GetMapping
    public ResponseEntity<User> getProfile(Authentication authentication){
        return ResponseEntity.ok(
            profileService.getProfile(authentication.getName())
        );
    }

    //CREATE PROFILE (first-time setup)
    @PostMapping
    public ResponseEntity<User> createProfile(
            @RequestBody ProfileCreateRequest request,
            Authentication authentication) {
            
        return ResponseEntity.ok(
                profileService.createProfile(authentication.getName(), request)
        );
    }
    
    //UPDATE PROFILE 
    @PutMapping
    public ResponseEntity<User> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                profileService.updateProfile(authentication.getName(), request)
        );
    }
}
