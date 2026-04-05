package com.veerana.team_service.service;

import com.veerana.team_service.dto.*;
import com.veerana.team_service.exception.AccessDeniedException;
import com.veerana.team_service.exception.ResourceNotFoundException;
import com.veerana.team_service.model.Team;
import com.veerana.team_service.model.TeamMember;
import com.veerana.team_service.model.TeamRole;
import com.veerana.team_service.repository.TeamMemberRepository;
import com.veerana.team_service.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository memberRepository;

    // =========================
    // CREATE TEAM
    // =========================
    public TeamResponse createTeam(String email, CreateTeamRequest request) {

        Team team = Team.builder()
                .name(request.name())
                .description(request.description())
                .ownerEmail(email)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        teamRepository.save(team);

        // Add creator as OWNER member
        memberRepository.save(
                TeamMember.builder()
                        .teamId(team.getId())
                        .userEmail(email)
                        .role(TeamRole.OWNER)
                        .joinedAt(LocalDateTime.now())
                        .build()
        );

        return map(team);
    }

    // =========================
    // MY TEAMS
    // =========================
    @Transactional(readOnly = true)
    public List<TeamResponse> myTeams(String email) {

        List<TeamMember> memberships = memberRepository.findByUserEmail(email);

        List<String> teamIds = memberships.stream()
                .map(TeamMember::getTeamId)
                .toList();

        return teamRepository.findAllById(teamIds)
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================
    // GET TEAM MEMBERS
    // =========================
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getMembers(String teamId, String email) {

        // Must be a member to view
        getMember(teamId, email);

        return memberRepository.findByTeamId(teamId)
                .stream()
                .map(this::mapMember)
                .toList();
    }

    // =========================
    // INVITE MEMBER
    // =========================
    public void inviteMember(String teamId,
                             String requesterEmail,
                             InviteMemberRequest request) {

        TeamMember requester = getMember(teamId, requesterEmail);

        // Only OWNER or ADMIN can invite
        if (requester.getRole() == TeamRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER or ADMIN can invite members");
        }

        // Can't invite someone already in team
        memberRepository.findByTeamIdAndUserEmail(teamId, request.email())
                .ifPresent(m -> {
                    throw new AccessDeniedException("User is already a team member");
                });

        // ADMIN cannot assign OWNER role
        if (requester.getRole() == TeamRole.ADMIN
                && request.role() == TeamRole.OWNER) {
            throw new AccessDeniedException("ADMIN cannot assign OWNER role");
        }

        memberRepository.save(
                TeamMember.builder()
                        .teamId(teamId)
                        .userEmail(request.email())
                        .role(request.role())
                        .joinedAt(LocalDateTime.now())
                        .build()
        );
    }

    // =========================
    // REMOVE MEMBER
    // =========================
    public void removeMember(String teamId,
                             String requesterEmail,
                             String targetEmail) {

        TeamMember requester = getMember(teamId, requesterEmail);

        if (requester.getRole() == TeamRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER or ADMIN can remove members");
        }

        TeamMember target = getMember(teamId, targetEmail);

        // Cannot remove OWNER
        if (target.getRole() == TeamRole.OWNER) {
            throw new AccessDeniedException("Cannot remove team OWNER");
        }

        memberRepository.delete(target);
    }

    // =========================
    // DELETE TEAM
    // =========================
    public void deleteTeam(String teamId, String email) {

        TeamMember member = getMember(teamId, email);

        if (member.getRole() != TeamRole.OWNER) {
            throw new AccessDeniedException("Only OWNER can delete team");
        }

        memberRepository.deleteByTeamId(teamId);
        teamRepository.deleteById(teamId);
    }

    // =========================
    // HELPERS
    // =========================
    private TeamMember getMember(String teamId, String email) {
        return memberRepository
                .findByTeamIdAndUserEmail(teamId, email)
                .orElseThrow(() ->
                        new AccessDeniedException("You are not a member of this team"));
    }

    private TeamResponse map(Team team) {
        return new TeamResponse(
                team.getId(),
                team.getName(),
                team.getDescription(),
                team.getOwnerEmail(),
                team.getCreatedAt()
        );
    }

    private TeamMemberResponse mapMember(TeamMember m) {
        return new TeamMemberResponse(
                m.getId(),
                m.getTeamId(),
                m.getUserEmail(),
                m.getRole(),
                m.getJoinedAt()
        );
    }
}