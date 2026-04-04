package com.veerana.user_service.service;

import com.veerana.user_service.dto.ProfileResponse;
import com.veerana.user_service.dto.UpdateProfileRequest;
import com.veerana.user_service.model.UserProfile;
import com.veerana.user_service.Repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository repository;

    public ProfileResponse getProfile(Authentication authentication) {

        String email = authentication.getName();

        UserProfile profile = repository.findById(email)
                .orElseGet(() -> repository.save(
                        UserProfile.builder()
                                .email(email)
                                .build()
                ));

        return mapToResponse(profile);
    }

    public ProfileResponse updateProfile(String email,
                                         UpdateProfileRequest request) {

        UserProfile profile = repository.findById(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        profile.setFullName(request.getFullName());
        profile.setBio(request.getBio());
        profile.setPhone(request.getPhone());

        repository.save(profile);

        return mapToResponse(profile);
    }

    private ProfileResponse mapToResponse(UserProfile profile) {
        return new ProfileResponse(
                profile.getEmail(),
                profile.getFullName(),
                profile.getBio(),
                profile.getPhone()
        );
    }
}