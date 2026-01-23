package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.model.EmergencyContact;
import com.travelplanner.backend.model.User;
import com.travelplanner.backend.repository.EmergencyContactRepository;
import com.travelplanner.backend.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmergencyContactService {
    @Autowired
    private EmergencyContactRepository emergencyContactRepository;

    @Autowired
    private UserRepository userRepository;

    public List<EmergencyContact> getUserContacts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return emergencyContactRepository.findByUserOrderByIsPrimaryDesc(user);
    }

    public EmergencyContact createContact(EmergencyContact contact, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If this is set as primary, unset other primary contacts
        if (contact.getIsPrimary()) {
            emergencyContactRepository.findByUserAndIsPrimaryTrue(user)
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        emergencyContactRepository.save(existing);
                    });
        }

        contact.setUser(user);
        contact.setCreatedAt(LocalDateTime.now());
        contact.setUpdatedAt(LocalDateTime.now());
        return emergencyContactRepository.save(contact);
    }

    public EmergencyContact updateContact(Long contactId, EmergencyContact contactDetails, Long userId) {
        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // If setting as primary, unset others
        if (contactDetails.getIsPrimary() && !contact.getIsPrimary()) {
            emergencyContactRepository.findByUserAndIsPrimaryTrue(contact.getUser())
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        emergencyContactRepository.save(existing);
                    });
        }

        contact.setName(contactDetails.getName());
        contact.setPhone(contactDetails.getPhone());
        contact.setEmail(contactDetails.getEmail());
        contact.setRelationship(contactDetails.getRelationship());
        contact.setIsPrimary(contactDetails.getIsPrimary());
        contact.setUpdatedAt(LocalDateTime.now());

        return emergencyContactRepository.save(contact);
    }

    public void deleteContact(Long contactId, Long userId) {
        EmergencyContact contact = emergencyContactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        emergencyContactRepository.delete(contact);
    }
}

