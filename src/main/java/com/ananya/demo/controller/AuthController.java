package com.ananya.demo.controller;

import com.ananya.demo.service.AuthService;
import com.ananya.demo.model.User;
import com.ananya.demo.dto.LoginRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @GetMapping("/ping")
    public String ping() {
        return "AUTH WORKING";
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return authService.register(user);
    }
@PostMapping("/signin")
public String login(@RequestBody LoginRequest request) {

    System.out.println("LOGIN API HIT");

    return authService.login(request.getEmail(), request.getPassword());
}

@GetMapping("/profile")
public String profile(){
    return "This is a protected profile";
}

}
