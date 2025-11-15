package com.travelplanner.backend.dto;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String bio;
    private String profileImageUrl;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactEmail;
}

