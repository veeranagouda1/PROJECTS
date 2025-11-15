package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.SosEvent;
import com.travelplanner.backend.model.User;

import java.util.List;

@Repository
public interface SosEventRepository extends JpaRepository<SosEvent, Long> {
    List<SosEvent> findByUserOrderByTimestampDesc(User user);
    List<SosEvent> findByStatusOrderByTimestampDesc(String status);
}

