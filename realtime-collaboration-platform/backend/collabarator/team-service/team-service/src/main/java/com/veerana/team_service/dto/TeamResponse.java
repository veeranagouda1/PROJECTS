package com.veerana.team_service.dto;

import java.time.LocalDateTime;

public record TeamResponse(
        String id,
        String name,
        String description,
        String ownerEmail,
        LocalDateTime createdAt
) {}