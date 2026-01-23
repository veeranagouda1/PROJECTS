package com.travelplanner.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.exception.UnauthorizedException;
import com.travelplanner.backend.model.EmergencyContact;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.UserRepository;
import com.travelplanner.backend.security.JwtTokenProvider;
import com.travelplanner.backend.service.EmergencyContactService;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(origins = "*")
public class EmergencyContactController {
    @Autowired
    private EmergencyContactService emergencyContactService;

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
    public ResponseEntity<List<EmergencyContact>> getUserContacts(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(emergencyContactService.getUserContacts(userId));
    }

    @PostMapping
    public ResponseEntity<EmergencyContact> createContact(@RequestBody EmergencyContact contact, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(emergencyContactService.createContact(contact, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyContact> updateContact(@PathVariable Long id, @RequestBody EmergencyContact contact, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        return ResponseEntity.ok(emergencyContactService.updateContact(id, contact, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        emergencyContactService.deleteContact(id, userId);
        return ResponseEntity.ok().build();
    }
}

