package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.IncidentRepository;
import com.travelplanner.backend.repository.ArticleRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class IncidentService {
    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

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

    public List<Map<String, Object>> getLiveIncidentsForHeatmap() {
        // Get recent incidents (last 24 hours)
        List<Incident> recentIncidents = incidentRepository.findAll().stream()
                .filter(incident -> {
                    if (incident.getReportedAt() == null)
                        return false;
                    return incident.getReportedAt().isAfter(LocalDateTime.now().minusHours(24));
                })
                .collect(Collectors.toList());

        return recentIncidents.stream().map(incident -> {
            Map<String, Object> point = new HashMap<>();
            point.put("lat", incident.getLatitude());
            point.put("lng", incident.getLongitude());
            point.put("severity", incident.getSeverity().name());
            point.put("type", incident.getType().name());
            point.put("id", incident.getId());
            // attach any articles linked to this incident (title, summary, url, id,
            // publishedAt, source)
            try {
                List<com.travelplanner.backend.model.Article> articles = articleRepository
                        .findByIncidentId(incident.getId());
                List<Map<String, Object>> articleSummaries = articles.stream().map(a -> {
                    Map<String, Object> ma = new HashMap<>();
                    ma.put("id", a.getId());
                    ma.put("title", a.getTitle());
                    ma.put("summary", a.getSummary());
                    ma.put("url", a.getUrl());
                    ma.put("source", a.getSource());
                    ma.put("publishedAt", a.getPublishedAt());
                    return ma;
                }).collect(Collectors.toList());
                point.put("articles", articleSummaries);
            } catch (Exception e) {
                point.put("articles", java.util.Collections.emptyList());
            }
            return point;
        }).collect(Collectors.toList());
    }
}
