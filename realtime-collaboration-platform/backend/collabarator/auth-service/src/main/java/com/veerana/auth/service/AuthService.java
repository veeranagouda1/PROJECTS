package com.veerana.auth.service;

import com.veerana.auth.dto.AuthResponse;
import com.veerana.auth.dto.LoginRequest;
import com.veerana.auth.dto.RegisterRequest;
import com.veerana.auth.model.AuthProvider;
import com.veerana.auth.model.RefreshToken;
import com.veerana.auth.model.User;
import com.veerana.auth.model.UserRole;
import com.veerana.auth.repo.RefreshTokenRepository;
import com.veerana.auth.repo.UserRepository;
import com.veerana.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    // =========================
    // REGISTER
    // =========================
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email already registered"
            );
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(UserRole.USER)
                .provider(AuthProvider.LOCAL)
                .enabled(true)
                .build();

        userRepository.save(user);

        return generateTokens(user);
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (user.getProvider() == AuthProvider.GOOGLE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please login using Google"
            );
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        return generateTokens(user);
    }

    // =========================
    // TOKEN GENERATION
    // =========================
    private AuthResponse generateTokens(User user) {

        // Single-session model:
        // Remove existing refresh token for this user
        refreshTokenRepository.deleteByUser(user);

        String accessToken =
                jwtService.generateAccessToken(
                        user.getEmail(),
                        user.getRole().name()
                );

        String refreshToken =
                jwtService.generateRefreshToken(user.getEmail());

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .token(refreshToken)
                        .user(user)
                        .expiryDate(Instant.now().plusMillis(refreshExpiration))
                        .build()
        );

        return new AuthResponse(accessToken, refreshToken);
    }

    // =========================
    // REFRESH
    // =========================
    public AuthResponse refresh(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid refresh token"
                ));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token expired"
            );
        }

        User user = token.getUser();

        String newAccessToken =
                jwtService.generateAccessToken(
                        user.getEmail(),
                        user.getRole().name()
                );

        return new AuthResponse(newAccessToken, refreshToken);
    }

    // =========================
    // LOGOUT
    // =========================
    public void logout(String refreshToken) {

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid refresh token"
                ));

        refreshTokenRepository.delete(token);
    }
}