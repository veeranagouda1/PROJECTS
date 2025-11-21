package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.model.Article;
import com.travelplanner.backend.repository.IncidentRepository;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.repository.ArticleRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class IncidentService {
    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                if (incident.getReportedAt() == null) return false;
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
            return point;
        }).collect(Collectors.toList());
    }

    private String getStateFromCoordinates(Double latitude, Double longitude) {
        try {
            String response = webClientBuilder.build()
                .get()
                .uri("https://nominatim.openstreetmap.org/reverse?format=json&lat=" + latitude + "&lon=" + longitude)
                .header("User-Agent", "TravelPlanner")
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            if (response != null) {
                JsonNode node = objectMapper.readTree(response);
                JsonNode address = node.get("address");
                if (address != null) {
                    JsonNode state = address.get("state");
                    if (state != null) {
                        return state.asText();
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Error getting state from coordinates: " + e.getMessage());
        }
        return null;
    }

    private List<Article> getArticlesByState(String state) {
        if (state == null || state.isEmpty()) {
            return new java.util.ArrayList<>();
        }
        
        return articleRepository.findAll().stream()
            .filter(article -> {
                String location = article.getLocation() != null ? article.getLocation().toLowerCase() : "";
                return location.contains(state.toLowerCase());
            })
            .sorted((a, b) -> b.getPublishedAt().compareTo(a.getPublishedAt()))
            .limit(10)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getSafetyReport(Double latitude, Double longitude, Double radius) {
        List<Incident> nearbyIncidents = getNearbyIncidents(latitude, longitude, radius);
        
        int criticalCount = 0;
        int highCount = 0;
        int mediumCount = 0;
        int lowCount = 0;
        
        for (Incident incident : nearbyIncidents) {
            switch (incident.getSeverity()) {
                case CRITICAL:
                    criticalCount++;
                    break;
                case HIGH:
                    highCount++;
                    break;
                case MEDIUM:
                    mediumCount++;
                    break;
                case LOW:
                    lowCount++;
                    break;
            }
        }
        
        String safetyLevel = "SAFE";
        if (criticalCount > 0) {
            safetyLevel = "CRITICAL";
        } else if (highCount >= 3 || criticalCount > 0) {
            safetyLevel = "DANGER";
        } else if (highCount > 0 || mediumCount >= 5) {
            safetyLevel = "WARNING";
        }
        
        List<Article> relevantArticles = articleRepository.findAll().stream()
            .sorted((a, b) -> b.getPublishedAt().compareTo(a.getPublishedAt()))
            .limit(10)
            .collect(Collectors.toList());
        
        if (relevantArticles.isEmpty()) {
            String state = getStateFromCoordinates(latitude, longitude);
            relevantArticles = getArticlesByState(state);
        }
        
        List<Map<String, Object>> incidentDetails = nearbyIncidents.stream().map(incident -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", incident.getId());
            detail.put("title", incident.getTitle());
            detail.put("description", incident.getDescription());
            detail.put("type", incident.getType().name());
            detail.put("severity", incident.getSeverity().name());
            detail.put("latitude", incident.getLatitude());
            detail.put("longitude", incident.getLongitude());
            detail.put("status", incident.getStatus());
            detail.put("reportedAt", incident.getReportedAt());
            detail.put("distance", calculateDistance(latitude, longitude, incident.getLatitude(), incident.getLongitude()));
            return detail;
        }).collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("safetyLevel", safetyLevel);
        response.put("criticalCount", criticalCount);
        response.put("highCount", highCount);
        response.put("mediumCount", mediumCount);
        response.put("lowCount", lowCount);
        response.put("totalIncidents", nearbyIncidents.size());
        response.put("incidents", incidentDetails);
        response.put("articles", relevantArticles);
        response.put("radius", radius);
        
        return response;
    }

    private Double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int R = 6371;
        Double latDistance = Math.toRadians(lat2 - lat1);
        Double lonDistance = Math.toRadians(lon2 - lon1);
        Double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        Double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }
}

