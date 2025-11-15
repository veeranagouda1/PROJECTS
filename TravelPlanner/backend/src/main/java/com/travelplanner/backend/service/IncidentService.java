package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.IncidentRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {
    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    public List<Incident> getIncidentsByStatus(String status) {
        return incidentRepository.findByStatusOrderByReportedAtDesc(status);
    }

    public List<Incident> getNearbyIncidents(Double latitude, Double longitude, Double radius) {
        return incidentRepository.findNearbyIncidents(latitude, longitude, radius);
    }

    public List<Incident> getAssignedIncidents(Long userId) {
        return incidentRepository.findByAssignedToIdOrderByReportedAtDesc(userId);
    }

    public Incident createIncident(Incident incident, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        incident.setReportedBy(user);
        incident.setReportedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());
        return incidentRepository.save(incident);
    }

    public Incident updateIncident(Long incidentId, Incident incidentDetails) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setTitle(incidentDetails.getTitle());
        incident.setDescription(incidentDetails.getDescription());
        incident.setType(incidentDetails.getType());
        incident.setSeverity(incidentDetails.getSeverity());
        incident.setStatus(incidentDetails.getStatus());
        incident.setUpdatedAt(LocalDateTime.now());

        if (incidentDetails.getAssignedTo() != null) {
            incident.setAssignedTo(incidentDetails.getAssignedTo());
        }

        if ("RESOLVED".equals(incidentDetails.getStatus()) || "CLOSED".equals(incidentDetails.getStatus())) {
            incident.setResolvedAt(LocalDateTime.now());
        }

        return incidentRepository.save(incident);
    }

    public void deleteIncident(Long incidentId) {
        incidentRepository.deleteById(incidentId);
    }
}

