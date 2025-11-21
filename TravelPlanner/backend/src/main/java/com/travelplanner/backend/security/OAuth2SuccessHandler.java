package com.travelplanner.backend.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.travelplanner.backend.dto.AuthResponse;
import com.travelplanner.backend.service.AuthService;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private AuthService authService;

    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    public void setAuthService(AuthService authService) {
        this.authService = authService;
    }

    @Autowired
    public void setJwtTokenProvider(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        try {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            String email = oauth2User.getAttribute("email");
            String name = oauth2User.getAttribute("name");

            AuthResponse authResponse = authService.loginOrRegisterWithOAuth2(email, name);
            
            String redirectUrl = String.format(
                "http://localhost:5173/oauth-callback?token=%s&email=%s&role=%s&userId=%d",
                authResponse.getToken(),
                authResponse.getEmail(),
                authResponse.getRole(),
                authResponse.getUserId()
            );
            
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            logger.error("OAuth2 authentication failed", e);
            getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/login?error=oauth_failed");
        }
    }
}
