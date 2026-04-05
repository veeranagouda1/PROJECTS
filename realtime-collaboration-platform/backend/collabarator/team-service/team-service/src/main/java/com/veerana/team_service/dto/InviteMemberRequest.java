package com.veerana.team_service.dto;

import com.veerana.team_service.model.TeamRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InviteMemberRequest(
        @Email @NotBlank String email,
        @NotNull TeamRole role
) {}