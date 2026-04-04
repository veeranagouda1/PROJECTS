package com.veerana.user_service.controller;

import com.veerana.user_service.dto.ProfileResponse;
import com.veerana.user_service.dto.UpdateProfileRequest;
import com.veerana.user_service.model.UserProfile;
import com.veerana.user_service.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService service;

    @GetMapping("/profile")
    public ProfileResponse getProfile(Authentication authentication) {
        return service.getProfile(authentication);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                service.updateProfile(email, request)
        );
    }
}
