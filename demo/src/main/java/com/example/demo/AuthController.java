package com.example.demo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Register
    @PostMapping("/register")
public ResponseEntity<?> register(@RequestBody User user) {

    if (userRepository.findByEmail(user.getEmail()) != null) {
        return ResponseEntity.badRequest().body("Email already exists");
    }

    userRepository.save(user);
    return ResponseEntity.ok("Registration successful");
}

    // Login
    @PostMapping("/login")
public ResponseEntity<?> login(@RequestBody User user) {

    User existingUser = userRepository.findByEmail(user.getEmail());

    if (existingUser == null) {
        return ResponseEntity.status(401).body("Invalid email");
    }

    if (!existingUser.getPassword().equals(user.getPassword())) {
        return ResponseEntity.status(401).body("Invalid password");
    }

    return ResponseEntity.ok(existingUser);  // 🔥 MUST return user
}
}