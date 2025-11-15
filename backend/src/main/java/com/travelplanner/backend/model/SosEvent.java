package com.travelplanner.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sos_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SosEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String message;
    private String status = "PENDING"; // PENDING, RESOLVED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    private LocalDateTime resolvedAt;
    private Boolean isOffline = false;
    private LocalDateTime lastKnownLocationTime;
    private LocalDateTime recoveredAt;
}

