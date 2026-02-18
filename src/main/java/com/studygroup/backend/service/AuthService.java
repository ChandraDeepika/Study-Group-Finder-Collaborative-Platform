package com.studygroup.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.studygroup.backend.model.User;
import com.studygroup.backend.repository.UserRepository;
import com.studygroup.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ REGISTER
    public String register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already exists";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return "User registered successfully";
    }

    // ✅ LOGIN + RETURN JWT TOKEN
    public String login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (passwordEncoder.matches(password, user.getPassword())) {

            // generate JWT token
            return jwtUtil.generateToken(user.getEmail());

        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}
