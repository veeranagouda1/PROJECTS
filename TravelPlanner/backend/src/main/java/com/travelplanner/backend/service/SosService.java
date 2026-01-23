package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.EmergencyContact;
import com.travelplanner.backend.model.SosEvent;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.EmergencyContactRepository;
import com.travelplanner.backend.repository.SosEventRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SosService {
    @Autowired
    private SosEventRepository sosEventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SmsService smsService;


    public SosEvent createSosEvent(SosEvent sosEvent, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        sosEvent.setUser(user);
        sosEvent.setTimestamp(LocalDateTime.now());
        sosEvent.setStatus("PENDING");

        SosEvent saved = sosEventRepository.save(sosEvent);

        // Notify emergency contacts
        notifyEmergencyContacts(user, sosEvent);

        return saved;
    }

    public List<SosEvent> getUserSosEvents(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return sosEventRepository.findByUserOrderByTimestampDesc(user);
    }

    public List<SosEvent> getPendingSosEvents() {
        return sosEventRepository.findByStatusOrderByTimestampDesc("PENDING");
    }

    public SosEvent updateSosStatus(Long sosId, String status) {
        SosEvent sosEvent = sosEventRepository.findById(sosId)
                .orElseThrow(() -> new RuntimeException("SOS event not found"));
        sosEvent.setStatus(status);
        if ("RESOLVED".equals(status)) {
            sosEvent.setResolvedAt(LocalDateTime.now());
        }
        return sosEventRepository.save(sosEvent);
    }

    public SosEvent createOfflineSosAlert(Double latitude, Double longitude, String message, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SosEvent sosEvent = new SosEvent();
        sosEvent.setUser(user);
        sosEvent.setLatitude(latitude);
        sosEvent.setLongitude(longitude);
        sosEvent.setMessage(message);
        sosEvent.setIsOffline(true);
        sosEvent.setLastKnownLocationTime(LocalDateTime.now());
        sosEvent.setTimestamp(LocalDateTime.now());
        sosEvent.setStatus("PENDING");

        SosEvent saved = sosEventRepository.save(sosEvent);
        notifyEmergencyContacts(user, sosEvent);

        return saved;
    }

    public SosEvent markOfflineRecovered(Long userId, Double latitude, Double longitude) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SosEvent recoveredEvent = new SosEvent();
        recoveredEvent.setUser(user);
        recoveredEvent.setLatitude(latitude);
        recoveredEvent.setLongitude(longitude);
        recoveredEvent.setMessage("User recovered from offline area");
        recoveredEvent.setIsOffline(false);
        recoveredEvent.setRecoveredAt(LocalDateTime.now());
        recoveredEvent.setTimestamp(LocalDateTime.now());
        recoveredEvent.setStatus("RESOLVED");

        SosEvent saved = sosEventRepository.save(recoveredEvent);
        notifyEmergencyContacts(user, recoveredEvent);

        return saved;
    }

    public List<SosEvent> getRecentSosEvents(int limit) {
        return sosEventRepository.findAll().stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    
    private void notifyEmergencyContacts(User user, SosEvent sosEvent) {
        List<EmergencyContact> contacts =
                emergencyContactRepository.findByUserOrderByIsPrimaryDesc(user);
    
        if (contacts.isEmpty()) return;
    
        // EMAIL NOTIFICATION
        emailService.sendSosNotification(user, sosEvent, contacts);
    
        // SMS NOTIFICATION
        String smsBody = "🚨 SOS ALERT 🚨\n" +
                "User: " + user.getFullName() + "\n" +
                "Phone: " + (user.getPhoneNumber() == null ? "Not provided" : user.getPhoneNumber()) + "\n" +
                "Location: https://maps.google.com/?q=" + sosEvent.getLatitude() + "," + sosEvent.getLongitude();
    
        for (EmergencyContact contact : contacts) {
            if (contact.getPhone() != null && !contact.getPhone().isEmpty()) {
                smsService.sendSms(contact.getPhone(), smsBody);
            }
        }
    }
    
}

