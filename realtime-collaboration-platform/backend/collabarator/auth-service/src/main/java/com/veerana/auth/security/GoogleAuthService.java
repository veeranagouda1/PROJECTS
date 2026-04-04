package com.veerana.auth.security;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.veerana.auth.dto.AuthResponse;
import com.veerana.auth.model.AuthProvider;
import com.veerana.auth.model.RefreshToken;
import com.veerana.auth.model.User;
import com.veerana.auth.model.UserRole;
import com.veerana.auth.repo.RefreshTokenRepository;
import com.veerana.auth.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiration;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    public AuthResponse authenticateWithGoogle(String idTokenString) {

        try {

            GoogleIdTokenVerifier verifier =
                    new GoogleIdTokenVerifier.Builder(
                            new NetHttpTransport(),
                            JacksonFactory.getDefaultInstance()
                    )
                            .setAudience(Collections.singletonList(googleClientId))
                            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid Google token"
                );
            }

            Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");

            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> userRepository.save(
                            User.builder()
                                    .email(email)
                                    .name(name)
                                    .provider(AuthProvider.GOOGLE)
                                    .role(UserRole.USER)
                                    .enabled(true)
                                    .build()
                    ));

            // Single-session refresh model
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

        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Google authentication failed"
            );
        }
    }
}