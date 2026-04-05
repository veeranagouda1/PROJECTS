package com.veerana.team_service.controller;

import com.veerana.team_service.dto.CreateTeamRequest;
import com.veerana.team_service.dto.InviteMemberRequest;
import com.veerana.team_service.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<?> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                teamService.createTeam(authentication.getName(), request)
        );
    }

    @GetMapping
    public ResponseEntity<?> myTeams(Authentication authentication) {
        return ResponseEntity.ok(
                teamService.myTeams(authentication.getName())
        );
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<?> getMembers(
            @PathVariable String teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                teamService.getMembers(teamId, authentication.getName())
        );
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<?> inviteMember(
            @PathVariable String teamId,
            @Valid @RequestBody InviteMemberRequest request,
            Authentication authentication
    ) {
        teamService.inviteMember(teamId, authentication.getName(), request);
        return ResponseEntity.ok("Member invited successfully");
    }

    @DeleteMapping("/{teamId}/members/{email}")
    public ResponseEntity<?> removeMember(
            @PathVariable String teamId,
            @PathVariable String email,
            Authentication authentication
    ) {
        teamService.removeMember(teamId, authentication.getName(), email);
        return ResponseEntity.ok("Member removed successfully");
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<?> deleteTeam(
            @PathVariable String teamId,
            Authentication authentication
    ) {
        teamService.deleteTeam(teamId, authentication.getName());
        return ResponseEntity.ok("Team deleted successfully");
    }
}