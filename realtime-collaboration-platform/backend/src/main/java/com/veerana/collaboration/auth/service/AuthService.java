package com.veerana.collaboration.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.veerana.collaboration.auth.dto.AuthResponse;
import com.veerana.collaboration.auth.dto.LoginRequest;
import com.veerana.collaboration.auth.dto.RegisterRequest;
import com.veerana.collaboration.auth.model.AuthProvider;
import com.veerana.collaboration.auth.model.Role;
import com.veerana.collaboration.auth.model.User;
import com.veerana.collaboration.auth.repository.UserRepository;
import com.veerana.collaboration.auth.security.JwtTokenProvider;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager,
            UserDetailsService userDetailsService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    // ================= REGISTER (EMAIL / PASSWORD) =================
    public AuthResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProvider(AuthProvider.LOCAL); // 🔑 IMPORTANT
        user.setEnabled(true);

        String roleStr = request.getRole() != null
                ? request.getRole().toUpperCase()
                : "VIEWER";

        user.setRole(Role.valueOf(roleStr));

        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String token = jwtTokenProvider.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getId(),
                user.getPhoneNumber());
    }

    // ================= LOGIN (EMAIL / PASSWORD ONLY) =================
    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProvider() == AuthProvider.GOOGLE && user.getPassword() == null) {
            throw new RuntimeException("Please login using Google first");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

            String token = jwtTokenProvider.generateToken(userDetails);

            return new AuthResponse(
                    token,
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getId(),
                    user.getPhoneNumber());

        } catch (BadCredentialsException ex) {
            throw new RuntimeException("Invalid email or password");
        }
    }

    public void setPassword(String token, String rawPassword) {

        String email = jwtTokenProvider.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() != null) {
            throw new RuntimeException("Password already set");
        }

        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

}
