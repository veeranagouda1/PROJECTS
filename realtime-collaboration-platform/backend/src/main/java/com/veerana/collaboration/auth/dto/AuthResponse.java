package com.veerana.collaboration.auth.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long userId;
    private String phoneNumber;

    public AuthResponse(
            String token,
            String email,
            String fullName,
            String role,
            Long userId,
            String phoneNumber) {

        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
    }

    public String getToken() {
        return token;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
}