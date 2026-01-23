package com.travelplanner.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.exception.UnauthorizedException;
import com.travelplanner.backend.model.SosEvent;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtTokenProvider;
import com.travelplanner.backend.service.SosService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sos")
@CrossOrigin(origins = "*")
public class SosController {
    @Autowired
    private SosService sosService;

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

    @GetMapping("/user")
    public ResponseEntity<List<SosEvent>> getUserSosEvents(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(sosService.getUserSosEvents(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SosEvent>> getPendingSosEvents() {
        return ResponseEntity.ok(sosService.getPendingSosEvents());
    }

    @PostMapping
    public ResponseEntity<SosEvent> createSosEvent(@RequestBody SosEvent sosEvent, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(sosService.createSosEvent(sosEvent, userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<SosEvent> updateSosStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(sosService.updateSosStatus(id, status));
    }

    @PostMapping("/offline-alert")
    public ResponseEntity<SosEvent> createOfflineAlert(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Double latitude = Double.parseDouble(body.get("latitude").toString());
        Double longitude = Double.parseDouble(body.get("longitude").toString());
        String message = body.getOrDefault("message", "Entering no-network area").toString();
        return ResponseEntity.ok(sosService.createOfflineSosAlert(latitude, longitude, message, userId));
    }

    @PostMapping("/offline-recovered")
    public ResponseEntity<SosEvent> markOfflineRecovered(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        Double latitude = Double.parseDouble(body.get("latitude").toString());
        Double longitude = Double.parseDouble(body.get("longitude").toString());
        return ResponseEntity.ok(sosService.markOfflineRecovered(userId, latitude, longitude));
    }
}

