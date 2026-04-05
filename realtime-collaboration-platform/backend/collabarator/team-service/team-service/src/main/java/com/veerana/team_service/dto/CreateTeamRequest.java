package com.veerana.team_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTeamRequest(
        @NotBlank String name,
        String description
) {}