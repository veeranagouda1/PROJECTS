package com.travelplanner.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.dto.ErrorResponse;
import com.travelplanner.backend.dto.UserProfileRequest;
import com.travelplanner.backend.exception.UnauthorizedException;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtTokenProvider;
import com.travelplanner.backend.service.UserService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = tokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        try {
            Long userId = getUserIdFromRequest(request);
            User user = userService.getUserById(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("fullName", user.getFullName());
            response.put("role", user.getRole().name());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("bio", user.getBio());
            response.put("profileImageUrl", user.getProfileImageUrl());
            response.put("emergencyContactName", user.getEmergencyContactName());
            response.put("emergencyContactPhone", user.getEmergencyContactPhone());
            response.put("emergencyContactEmail", user.getEmergencyContactEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(Map.of("success", false, "message", "Unauthorized"));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileRequest request, HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromRequest(httpRequest);
            User updated = userService.updateUserProfile(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", updated.getId());
            response.put("email", updated.getEmail());
            response.put("fullName", updated.getFullName());
            response.put("phoneNumber", updated.getPhoneNumber());
            response.put("bio", updated.getBio());
            response.put("profileImageUrl", updated.getProfileImageUrl());
            response.put("emergencyContactName", updated.getEmergencyContactName());
            response.put("emergencyContactPhone", updated.getEmergencyContactPhone());
            response.put("emergencyContactEmail", updated.getEmergencyContactEmail());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }
}

