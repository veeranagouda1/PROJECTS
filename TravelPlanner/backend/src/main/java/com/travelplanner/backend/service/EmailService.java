package com.travelplanner.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.beans.factory.annotation.Autowired;

import com.travelplanner.backend.model.EmergencyContact;
import com.travelplanner.backend.model.SosEvent;
import com.travelplanner.backend.model.User;

import java.util.List;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.enabled:false}")
    private boolean emailEnabled;

    public void sendSosNotification(User user, SosEvent sosEvent, List<EmergencyContact> contacts) {

        // If email not enabled, log to console instead (development mode)
        if (!emailEnabled || mailSender == null) {

            System.out.println("=== SOS EMAIL NOTIFICATION ===");
            System.out.println("To: " +
                contacts.stream()
                        .map(EmergencyContact::getEmail)
                        .filter(email -> email != null && !email.isEmpty())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("No email contacts")
            );
            System.out.println("Subject: URGENT: SOS Alert from " + user.getFullName());
            System.out.println("Body: " + buildSosEmailBody(user, sosEvent));
            System.out.println("==============================");

            return;
        }

        // Real email sending
        for (EmergencyContact contact : contacts) {
            if (contact.getEmail() != null && !contact.getEmail().isEmpty()) {
                try {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(contact.getEmail());
                    message.setSubject("URGENT: SOS Alert from " + user.getFullName());
                    message.setText(buildSosEmailBody(user, sosEvent));
                    mailSender.send(message);

                } catch (Exception e) {
                    System.err.println("Failed to send email to " + contact.getEmail() + ": " + e.getMessage());
                }
            }
        }
    }

    private String buildSosEmailBody(User user, SosEvent sosEvent) {
        StringBuilder body = new StringBuilder();
        body.append("URGENT SOS ALERT\n\n");
        body.append("User: ").append(user.getFullName()).append("\n");
        body.append("Email: ").append(user.getEmail()).append("\n");
        body.append("Phone: ").append(user.getPhoneNumber() != null ? user.getPhoneNumber() : "Not provided").append("\n\n");

        body.append("Location:\n");
        body.append("Latitude: ").append(sosEvent.getLatitude()).append("\n");
        body.append("Longitude: ").append(sosEvent.getLongitude()).append("\n");
        body.append("Google Maps: https://www.google.com/maps?q=")
            .append(sosEvent.getLatitude()).append(",").append(sosEvent.getLongitude()).append("\n\n");

        body.append("Time: ").append(sosEvent.getTimestamp()).append("\n");

        if (sosEvent.getMessage() != null && !sosEvent.getMessage().isEmpty()) {
            body.append("Message: ").append(sosEvent.getMessage()).append("\n");
        }

        if (sosEvent.getIsOffline() != null && sosEvent.getIsOffline()) {
            body.append("\n⚠️ NOTE: This SOS was sent while the user was offline.\n");
        }

        body.append("\nPlease take immediate action to assist this user.");
        return body.toString();
    }
}
