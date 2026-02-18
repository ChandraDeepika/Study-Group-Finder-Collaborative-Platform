package com.example.demo;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    // ✅ GET PROFILE
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {

        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(optionalUser.get());
    }

    // ✅ UPDATE PROFILE WITH IMAGE UPLOAD
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam String location,
            @RequestParam String educationLevel,
            @RequestParam String field,
            @RequestParam String skills,
            @RequestParam String bio,
            @RequestParam(required = false) MultipartFile image
    ) {

        try {

            Optional<User> optionalUser = userRepository.findById(id);

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }

            User user = optionalUser.get();

            user.setName(name);
            user.setLocation(location);
            user.setEducationLevel(educationLevel);
            user.setField(field);
            user.setSkills(skills);
            user.setBio(bio);

            // ✅ SAVE IMAGE PROPERLY
            if (image != null && !image.isEmpty()) {

                String uploadDir = System.getProperty("user.dir") + "/uploads/";

                File directory = new File(uploadDir);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                String fileName = id + "_" + image.getOriginalFilename();
                File destination = new File(uploadDir + fileName);

                image.transferTo(destination);

                user.setProfileImage(fileName);
            }

            userRepository.save(user);

            return ResponseEntity.ok("Profile updated successfully");

        } catch (IOException e) {
            return ResponseEntity.status(500).body("Error saving profile image");
        }
    }
}