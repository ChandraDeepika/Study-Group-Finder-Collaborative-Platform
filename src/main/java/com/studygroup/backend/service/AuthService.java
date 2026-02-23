package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.security.JwtUtil;

import java.io.File;
import java.io.IOException;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ FULL REGISTER WITH PROFILE
    public String registerWithProfile(
            String name,
            String email,
            String password,
            String location,
            String educationLevel,
            String field,
            String skills,
            String bio,
            MultipartFile image
    ) {

        email = email.toLowerCase();

        if (userRepository.findByEmail(email).isPresent()) {
            return "Email already exists";
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setLocation(location);
        user.setEducationLevel(educationLevel);
        user.setField(field);
        user.setSkills(skills);
        user.setBio(bio);

        if (image != null && !image.isEmpty()) {
            try {
                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                File file = new File(uploadDir + fileName);

                image.transferTo(file);
                user.setProfileImage(fileName);

            } catch (IOException e) {
                return "Image upload failed";
            }
        }

        userRepository.save(user);

        return "User registered successfully";
    }

    // ✅ LOGIN (NOW RETURNS TOKEN WITH USER ID)
    public String login(String email, String password) {

        email = email.toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(password, user.getPassword())) {

            // 🔥 IMPORTANT CHANGE
            return jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId()
            );

        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}