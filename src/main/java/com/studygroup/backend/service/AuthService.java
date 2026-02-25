package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.studygroup.backend.dto.LoginResponse;
import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.backend.security.JwtUtil;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

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
            String originalName = image.getOriginalFilename();
            if (originalName != null && !originalName.isBlank()) {
                String ext = originalName.contains(".")
                        ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
                        : "";
                if (ext.matches("\\.(jpg|jpeg|png|gif|webp)")) {
                    try {
                        Path uploadDir = Path.of(System.getProperty("user.dir"), "uploads");
                        Files.createDirectories(uploadDir);

                        String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
                        String fileName = System.currentTimeMillis() + "_" + safeName;
                        Path targetPath = uploadDir.resolve(fileName);

                        image.transferTo(targetPath.toFile());
                        user.setProfileImage(fileName);
                    } catch (IOException e) {
                        // Save user without profile image
                    }
                }
            }
        }

        userRepository.save(user);
        return "User registered successfully";
    }

    // ✅ LOGIN (RETURNS TOKEN + USER INFO)
    public LoginResponse login(String email, String password) {
        email = email.toLowerCase();

        // Authenticate via Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
        );

        // Load user to build full response
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return new LoginResponse(token, user.getId(), user.getEmail(), user.getName());
    }
}
