package com.veerana.auth.controller;

import com.veerana.auth.dto.AuthResponse;
import com.veerana.auth.dto.LoginRequest;
import com.veerana.auth.dto.LogoutRequest;
import com.veerana.auth.dto.RegisterRequest;
import com.veerana.auth.security.GoogleAuthService;
import com.veerana.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    // =========================
    // GOOGLE LOGIN
    // =========================
    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(
            @RequestBody Map<String, String> request
    ) throws Exception {

        String idToken = request.get("idToken");

        if (idToken == null || idToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Google ID token is required"
            );
        }

        return ResponseEntity.ok(
                googleAuthService.authenticateWithGoogle(idToken)
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @RequestBody Map<String, String> request
    ) {
        String refreshToken = request.get("refreshToken");
        return ResponseEntity.ok(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(
            @RequestBody LogoutRequest request
    ) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok("Logged out successfully");
    }
}