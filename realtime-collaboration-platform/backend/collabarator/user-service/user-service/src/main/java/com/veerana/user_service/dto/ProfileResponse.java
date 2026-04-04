package com.veerana.user_service.dto;

public record ProfileResponse(
        String email,
        String fullName,
        String bio,
        String phone
) {}