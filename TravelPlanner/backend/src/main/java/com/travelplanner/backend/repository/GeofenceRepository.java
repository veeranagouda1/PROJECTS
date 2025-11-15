package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.Geofence;

import java.util.List;

@Repository
public interface GeofenceRepository extends JpaRepository<Geofence, Long> {
    @Query(value = "SELECT * FROM geofences WHERE " +
            "(6371000 * acos(cos(radians(:lat)) * cos(radians(center_latitude)) * " +
            "cos(radians(center_longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(center_latitude)))) <= radius",
            nativeQuery = true)
    List<Geofence> findNearbyGeofences(@Param("lat") Double latitude, @Param("lng") Double longitude);
}

