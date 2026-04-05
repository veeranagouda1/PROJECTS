package com.veerana.team_service.repository;

import com.veerana.team_service.model.TeamMember;
import com.veerana.team_service.model.TeamRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface TeamMemberRepository extends JpaRepository<TeamMember, String> {

    Optional<TeamMember> findByTeamIdAndUserEmail(String teamId, String userEmail);

    List<TeamMember> findByTeamId(String teamId);

    List<TeamMember> findByUserEmail(String userEmail);

    @Transactional
    void deleteByTeamId(String teamId);
}