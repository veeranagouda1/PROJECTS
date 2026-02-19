package com.veerana.collaboration.auth.controller;

import org.springframework.web.bind.annotation.*;

import com.veerana.collaboration.auth.dto.AuthResponse;
import com.veerana.collaboration.auth.dto.LoginRequest;
import com.veerana.collaboration.auth.dto.RegisterRequest;
import com.veerana.collaboration.auth.dto.SetPasswordRequest;
import com.veerana.collaboration.auth.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/set-password")
    public void setPassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody SetPasswordRequest request) {

        String token = authHeader.replace("Bearer ", "");
        authService.setPassword(token, request.getPassword());
    }
}
