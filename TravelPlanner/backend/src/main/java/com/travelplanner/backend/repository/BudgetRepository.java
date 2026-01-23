package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.Budget;
import com.travelplanner.backend.model.User;

import java.util.List;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserOrderByCreatedAtDesc(User user);
    List<Budget> findByTripId(Long tripId);
}

