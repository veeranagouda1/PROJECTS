package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.Geofence;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.GeofenceRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GeofenceService {
    @Autowired
    private GeofenceRepository geofenceRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Geofence> getAllGeofences() {
        return geofenceRepository.findAll();
    }

    public List<Geofence> getNearbyGeofences(Double latitude, Double longitude) {
        return geofenceRepository.findNearbyGeofences(latitude, longitude);
    }

    public Geofence createGeofence(Geofence geofence, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        geofence.setCreatedBy(user);
        geofence.setCreatedAt(LocalDateTime.now());
        geofence.setUpdatedAt(LocalDateTime.now());
        return geofenceRepository.save(geofence);
    }

    public Geofence updateGeofence(Long geofenceId, Geofence geofenceDetails) {
        Geofence geofence = geofenceRepository.findById(geofenceId)
                .orElseThrow(() -> new RuntimeException("Geofence not found"));

        geofence.setName(geofenceDetails.getName());
        geofence.setCenterLatitude(geofenceDetails.getCenterLatitude());
        geofence.setCenterLongitude(geofenceDetails.getCenterLongitude());
        geofence.setRadius(geofenceDetails.getRadius());
        geofence.setSafetyLevel(geofenceDetails.getSafetyLevel());
        geofence.setDescription(geofenceDetails.getDescription());
        geofence.setUpdatedAt(LocalDateTime.now());

        return geofenceRepository.save(geofence);
    }

    public void deleteGeofence(Long geofenceId) {
        geofenceRepository.deleteById(geofenceId);
    }
}

