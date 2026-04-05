package com.veerana.team_service.repository;

import com.veerana.team_service.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByOwnerEmail(String ownerEmail);
}