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

        // ✅ FIX: no manual timestamps — @PrePersist on Team handles it
        Team team = Team.builder()
                .name(request.name())
                .description(request.description())
                .ownerEmail(email)
                .build();

        teamRepository.save(team);

        // ✅ FIX: no manual joinedAt — @PrePersist on TeamMember handles it
        memberRepository.save(
                TeamMember.builder()
                        .teamId(team.getId())
                        .userEmail(email)
                        .role(TeamRole.OWNER)
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
        getMember(teamId, email); // must be a member to view
        return memberRepository.findByTeamId(teamId)
                .stream()
                .map(this::mapMember)
                .toList();
    }

    // =========================
    // INVITE MEMBER
    // =========================
    public void inviteMember(String teamId, String requesterEmail, InviteMemberRequest request) {

        TeamMember requester = getMember(teamId, requesterEmail);

        if (requester.getRole() == TeamRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER or ADMIN can invite members");
        }

        memberRepository.findByTeamIdAndUserEmail(teamId, request.email())
                .ifPresent(m -> {
                    throw new AccessDeniedException("User is already a team member");
                });

        if (requester.getRole() == TeamRole.ADMIN && request.role() == TeamRole.OWNER) {
            throw new AccessDeniedException("ADMIN cannot assign OWNER role");
        }

        // ✅ FIX: no manual joinedAt
        memberRepository.save(
                TeamMember.builder()
                        .teamId(teamId)
                        .userEmail(request.email())
                        .role(request.role())
                        .build()
        );
    }

    // =========================
    // REMOVE MEMBER
    // =========================
    public void removeMember(String teamId, String requesterEmail, String targetEmail) {

        TeamMember requester = getMember(teamId, requesterEmail);

        if (requester.getRole() == TeamRole.MEMBER) {
            throw new AccessDeniedException("Only OWNER or ADMIN can remove members");
        }

        TeamMember target = getMember(teamId, targetEmail);

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
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this team"));
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