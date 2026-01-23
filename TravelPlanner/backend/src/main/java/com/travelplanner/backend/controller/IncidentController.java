package com.travelplanner.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.exception.UnauthorizedException;
import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtTokenProvider;
import com.travelplanner.backend.service.IncidentService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incident")
@CrossOrigin(origins = "*")
public class IncidentController {
    @Autowired
    private IncidentService incidentService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        String email = tokenProvider.getEmailFromToken(token);
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @GetMapping
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Incident>> getIncidentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(incidentService.getIncidentsByStatus(status));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Incident>> getNearbyIncidents(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5000") Double radius) {
        return ResponseEntity.ok(incidentService.getNearbyIncidents(latitude, longitude, radius));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<Incident>> getAssignedIncidents(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(incidentService.getAssignedIncidents(userId));
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(incidentService.createIncident(incident, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Incident> updateIncident(@PathVariable Long id, @RequestBody Incident incident) {
        return ResponseEntity.ok(incidentService.updateIncident(id, incident));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/live")
    public ResponseEntity<List<Map<String, Object>>> getLiveIncidents() {
        return ResponseEntity.ok(incidentService.getLiveIncidentsForHeatmap());
    }
}

