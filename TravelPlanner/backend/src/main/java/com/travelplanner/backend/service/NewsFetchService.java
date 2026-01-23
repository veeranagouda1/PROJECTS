package com.travelplanner.backend.service;

import com.travelplanner.backend.model.Article;
import com.travelplanner.backend.model.Incident;
import com.travelplanner.backend.repository.ArticleRepository;
import com.travelplanner.backend.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewsFetchService {
    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Value("${newsapi.key:}")
    private String newsApiKey;

    private final WebClient webClient = WebClient.builder().build();

    // Run every 15 minutes
    @Scheduled(fixedDelayString = "${news.fetch.interval.ms:900000}")
    public void scheduledFetch() {
        if (newsApiKey == null || newsApiKey.isBlank())
            return; // disabled when no key
        fetchAndMatchArticles();
    }

    public List<Article> fetchAndMatchArticles() {
        List<Article> saved = new ArrayList<>();

        try {
            // Simple query for travel incidents
            String q = "(accident OR theft OR assault OR \"medical emergency\" OR \"travel safety\")";
            String url = "https://newsapi.org/v2/everything?q="
                    + java.net.URLEncoder.encode(q, java.nio.charset.StandardCharsets.UTF_8)
                    + "&pageSize=50&sortBy=publishedAt&language=en";

            var resp = webClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .header("Authorization", newsApiKey)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            if (resp == null)
                return saved;

            // minimal JSON parsing without extra deps
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var root = mapper.readTree(resp);
            var articlesNode = root.path("articles");
            if (!articlesNode.isArray())
                return saved;

            List<Incident> incidents = incidentRepository.findAll();

            for (var an : articlesNode) {
                String title = an.path("title").asText(null);
                String description = an.path("description").asText(null);
                String urlStr = an.path("url").asText(null);
                String sourceName = an.path("source").path("name").asText(null);
                String publishedAt = an.path("publishedAt").asText(null);

                if (urlStr == null || urlStr.isBlank())
                    continue;
                // skip if we already have this URL
                if (!articleRepository.findByUrl(urlStr).isEmpty())
                    continue;

                String text = ((title == null) ? "" : title).toLowerCase() + " "
                        + ((description == null) ? "" : description).toLowerCase();

                // match to incidents by simple keyword matching on incident type or title
                for (Incident inc : incidents) {
                    boolean matches = false;
                    if (inc.getType() != null) {
                        String type = inc.getType().name().toLowerCase();
                        if (text.contains(type))
                            matches = true;
                    }
                    if (!matches && inc.getTitle() != null && !inc.getTitle().isBlank()) {
                        String[] words = inc.getTitle().toLowerCase().split("\\W+");
                        for (String w : words) {
                            if (w.length() < 4)
                                continue;
                            if (text.contains(w)) {
                                matches = true;
                                break;
                            }
                        }
                    }

                    if (matches) {
                        Article a = new Article();
                        a.setTitle(title != null ? title : "News");
                        a.setSummary(description);
                        a.setContent(description != null ? description : "");
                        a.setSource(sourceName);
                        a.setUrl(urlStr);
                        a.setCategory("NEWS");
                        try {
                            a.setPublishedAt(LocalDateTime.parse(publishedAt.substring(0, 19)));
                        } catch (Exception e) {
                            a.setPublishedAt(LocalDateTime.now());
                        }
                        a.setCreatedAt(LocalDateTime.now());
                        a.setUpdatedAt(LocalDateTime.now());
                        a.setIncident(inc);
                        saved.add(articleRepository.save(a));
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("NewsFetchService failed: " + e.getMessage());
        }

        return saved;
    }
}
