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

    // Manual getters since Lombok isn't working
    public String getFullName() {
        return fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getBio() {
        return bio;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public String getEmergencyContactEmail() {
        return emergencyContactEmail;
    }
}

