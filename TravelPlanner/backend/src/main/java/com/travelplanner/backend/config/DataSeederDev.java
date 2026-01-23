package com.travelplanner.backend.config;

import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.model.Article;
import com.travelplanner.backend.repository.IncidentRepository;
import com.travelplanner.backend.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;

@Component
@Profile("dev")
public class DataSeederDev implements CommandLineRunner {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ArticleRepository articleRepository;

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

                Incident si1 = incidentRepository.save(i1);
                Incident si2 = incidentRepository.save(i2);
                Incident si3 = incidentRepository.save(i3);

                // Create sample articles linked to incidents
                Article a1 = new Article();
                a1.setTitle("Market theft reported — stay alert");
                a1.setSummary(
                        "A theft was reported near the central market area. Be cautious and avoid isolated spots.");
                a1.setContent("Local news: A theft occurred near the market. Police advise vigilance...");
                a1.setSource("Local News");
                a1.setUrl("https://example.com/local/market-theft");
                a1.setCategory("NEWS");
                a1.setPublishedAt(java.time.LocalDateTime.now().minusHours(1));
                a1.setCreatedAt(java.time.LocalDateTime.now());
                a1.setUpdatedAt(java.time.LocalDateTime.now());
                a1.setIncident(si1);

                Article a2 = new Article();
                a2.setTitle("Accident on Main St — traffic advisory");
                a2.setSummary("Traffic delays after an accident on Main St. Emergency services on site.");
                a2.setContent("An accident involving multiple vehicles occurred on Main St...");
                a2.setSource("Traffic Watch");
                a2.setUrl("https://example.com/local/main-st-accident");
                a2.setCategory("SAFETY");
                a2.setPublishedAt(java.time.LocalDateTime.now().minusHours(5));
                a2.setCreatedAt(java.time.LocalDateTime.now());
                a2.setUpdatedAt(java.time.LocalDateTime.now());
                a2.setIncident(si2);

                Article a3 = new Article();
                a3.setTitle("Medical emergency at downtown — hospitals responded");
                a3.setSummary(
                        "Emergency services responded to a medical emergency downtown; locals urged to give space.");
                a3.setContent("Emergency responders attended a medical emergency... ");
                a3.setSource("Health Alerts");
                a3.setUrl("https://example.com/local/medical-emergency");
                a3.setCategory("NEWS");
                a3.setPublishedAt(java.time.LocalDateTime.now().minusMinutes(45));
                a3.setCreatedAt(java.time.LocalDateTime.now());
                a3.setUpdatedAt(java.time.LocalDateTime.now());
                a3.setIncident(si3);

                articleRepository.saveAll(Arrays.asList(a1, a2, a3));

                System.out.println(
                        "DataSeederDev: seeded 3 incidents and 3 linked articles for heatmap demo (dev profile)");
            }
        } catch (Exception e) {
            System.err.println("DataSeederDev failed: " + e.getMessage());
        }
    }
}
