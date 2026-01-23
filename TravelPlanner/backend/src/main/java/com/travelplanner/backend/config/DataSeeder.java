package com.travelplanner.backend.config;

import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IncidentRepository incidentRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (incidentRepository.count() == 0) {
                Incident i1 = new Incident();
                i1.setLatitude(12.9716);
                i1.setLongitude(77.5946);
                i1.setTitle("Seeded: Theft near market");
                i1.setDescription("Sample seeded incident for heatmap demo");
                i1.setType(Incident.IncidentType.THEFT);
                i1.setSeverity(Incident.IncidentSeverity.HIGH);
                i1.setStatus("OPEN");
                i1.setReportedAt(LocalDateTime.now().minusHours(2));
                i1.setUpdatedAt(LocalDateTime.now().minusHours(2));

                Incident i2 = new Incident();
                i2.setLatitude(12.9728);
                i2.setLongitude(77.5958);
                i2.setTitle("Seeded: Accident on Main St");
                i2.setDescription("Sample seeded accident for heatmap demo");
                i2.setType(Incident.IncidentType.ACCIDENT);
                i2.setSeverity(Incident.IncidentSeverity.MEDIUM);
                i2.setStatus("OPEN");
                i2.setReportedAt(LocalDateTime.now().minusHours(6));
                i2.setUpdatedAt(LocalDateTime.now().minusHours(6));

                Incident i3 = new Incident();
                i3.setLatitude(12.9700);
                i3.setLongitude(77.5930);
                i3.setTitle("Seeded: Medical emergency");
                i3.setDescription("Sample seeded medical emergency for heatmap demo");
                i3.setType(Incident.IncidentType.MEDICAL_EMERGENCY);
                i3.setSeverity(Incident.IncidentSeverity.CRITICAL);
                i3.setStatus("OPEN");
                i3.setReportedAt(LocalDateTime.now().minusHours(1));
                i3.setUpdatedAt(LocalDateTime.now().minusHours(1));

                incidentRepository.saveAll(Arrays.asList(i1, i2, i3));
                System.out.println("DataSeeder: seeded 3 incidents for heatmap demo");
            }
        } catch (Exception e) {
            System.err.println("DataSeeder failed: " + e.getMessage());
        }
    }
}
