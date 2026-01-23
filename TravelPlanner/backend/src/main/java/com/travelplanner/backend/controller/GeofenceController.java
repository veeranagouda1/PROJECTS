package com.travelplanner.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.exception.UnauthorizedException;
import com.travelplanner.backend.model.Geofence;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtTokenProvider;
import com.travelplanner.backend.service.GeofenceService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geofence")
@CrossOrigin(origins = "*")
public class GeofenceController {
    @Autowired
    private GeofenceService geofenceService;

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
    public ResponseEntity<List<Geofence>> getAllGeofences() {
        return ResponseEntity.ok(geofenceService.getAllGeofences());
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Geofence>> getNearbyGeofences(@RequestParam Double latitude, @RequestParam Double longitude) {
        return ResponseEntity.ok(geofenceService.getNearbyGeofences(latitude, longitude));
    }

    @PostMapping
    public ResponseEntity<Geofence> createGeofence(@RequestBody Geofence geofence, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(geofenceService.createGeofence(geofence, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Geofence> updateGeofence(@PathVariable Long id, @RequestBody Geofence geofence) {
        return ResponseEntity.ok(geofenceService.updateGeofence(id, geofence));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGeofence(@PathVariable Long id) {
        geofenceService.deleteGeofence(id);
        return ResponseEntity.ok().build();
    }
}

