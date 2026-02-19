package com.veerana.collaboration.auth.config;

import java.io.IOException;
import java.time.LocalDateTime;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.veerana.collaboration.auth.model.AuthProvider;
import com.veerana.collaboration.auth.model.Role;
import com.veerana.collaboration.auth.model.User;
import com.veerana.collaboration.auth.repository.UserRepository;
import com.veerana.collaboration.auth.security.JwtTokenProvider;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            throw new RuntimeException("Google OAuth did not return email");
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : "Google User");
            user.setRole(Role.VIEWER);
            user.setProvider(AuthProvider.GOOGLE);
            user.setPassword(null); // IMPORTANT
            user.setEnabled(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
        } else {
            user.setProvider(AuthProvider.GOOGLE);
            user.setUpdatedAt(LocalDateTime.now());
        }

        userRepository.save(user);

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

        boolean needsPassword = (user.getPassword() == null);

        String redirectUrl = needsPassword
                ? "http://localhost:5173/set-password?token=" + token
                : "http://localhost:5173/oauth-success?token=" + token
                        + "&role=" + user.getRole().name();

        response.sendRedirect(redirectUrl);
    }
}
