package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.Incident;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatusOrderByReportedAtDesc(String status);
    List<Incident> findByAssignedToIdOrderByReportedAtDesc(Long userId);
    
    @Query(value = "SELECT * FROM incidents WHERE " +
            "(6371000 * acos(cos(radians(:lat)) * cos(radians(latitude)) * " +
            "cos(radians(longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(latitude)))) <= :radius",
            nativeQuery = true)
    List<Incident> findNearbyIncidents(@Param("lat") Double latitude, @Param("lng") Double longitude, @Param("radius") Double radius);
}

