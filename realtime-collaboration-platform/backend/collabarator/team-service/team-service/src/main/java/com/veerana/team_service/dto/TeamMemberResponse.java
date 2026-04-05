package com.veerana.team_service.dto;

import com.veerana.team_service.model.TeamRole;
import java.time.LocalDateTime;

public record TeamMemberResponse(
        String id,
        String teamId,
        String userEmail,
        TeamRole role,
        LocalDateTime joinedAt
) {}