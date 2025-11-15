package com.travelplanner.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private IncidentType type;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private IncidentSeverity severity = IncidentSeverity.MEDIUM;

    private String status = "OPEN"; // OPEN, INVESTIGATING, RESOLVED, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by")
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "geofence_id")
    private Geofence geofence;

    @Column(nullable = false, updatable = false)
    private LocalDateTime reportedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum IncidentType {
        THEFT, ACCIDENT, ASSAULT, NATURAL_DISASTER, MEDICAL_EMERGENCY, OTHER
    }

    public enum IncidentSeverity {
        LOW, MEDIUM, HIGH, CRITICAL
    }
}

