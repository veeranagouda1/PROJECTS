package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.Trip;
import com.travelplanner.backend.model.User;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserOrderByStartDateDesc(User user);
}

