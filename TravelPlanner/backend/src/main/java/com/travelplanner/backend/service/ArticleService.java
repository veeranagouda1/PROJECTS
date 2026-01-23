package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.travelplanner.backend.model.Article;
import com.travelplanner.backend.repository.ArticleRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ArticleService {
    @Autowired
    private ArticleRepository articleRepository;

    public List<Article> getAllArticles() {
        return articleRepository.findAllByOrderByPublishedAtDesc();
    }

    public List<Article> getArticlesByCategory(String category) {
        return articleRepository.findByCategoryOrderByPublishedAtDesc(category);
    }

    public Article createArticle(Article article) {
        article.setPublishedAt(LocalDateTime.now());
        article.setCreatedAt(LocalDateTime.now());
        article.setUpdatedAt(LocalDateTime.now());
        return articleRepository.save(article);
    }

    public Article updateArticle(Long articleId, Article articleDetails) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setTitle(articleDetails.getTitle());
        article.setContent(articleDetails.getContent());
        article.setSummary(articleDetails.getSummary());
        article.setImageUrl(articleDetails.getImageUrl());
        article.setSource(articleDetails.getSource());
        article.setCategory(articleDetails.getCategory());
        article.setUpdatedAt(LocalDateTime.now());

        return articleRepository.save(article);
    }

    public void deleteArticle(Long articleId) {
        articleRepository.deleteById(articleId);
    }

    public List<Article> fetchLiveArticles() {
        List<Article> articles = new ArrayList<>();
        WebClient webClient = WebClient.builder().build();

        try {
            // Fetch from NewsAPI (travel news)
            String newsApiUrl = "https://newsapi.org/v2/everything?q=travel+safety&sortBy=publishedAt&apiKey=demo";
            // Note: Replace with actual API key in production

            // For demo purposes, create sample articles
            // In production, you would fetch from NewsAPI, Google News RSS, or Travel
            // Advisory APIs
            Article article1 = new Article();
            article1.setTitle("Travel Safety Tips for 2024");
            article1.setSummary("Essential safety guidelines for modern travelers");
            article1.setContent("Stay safe while traveling with these essential tips...");
            article1.setCategory("SAFETY");
            article1.setSource("Travel Safety News");
            article1.setPublishedAt(LocalDateTime.now());
            article1.setCreatedAt(LocalDateTime.now());
            article1.setUpdatedAt(LocalDateTime.now());
            articles.add(article1);

            Article article2 = new Article();
            article2.setTitle("Latest Travel Advisories");
            article2.setSummary("Current travel warnings and advisories");
            article2.setContent("Check the latest travel advisories before your trip...");
            article2.setCategory("NEWS");
            article2.setSource("Travel Advisory Service");
            article2.setPublishedAt(LocalDateTime.now().minusHours(2));
            article2.setCreatedAt(LocalDateTime.now());
            article2.setUpdatedAt(LocalDateTime.now());
            articles.add(article2);

            Article article3 = new Article();
            article3.setTitle("Emergency Preparedness Guide");
            article3.setSummary("How to prepare for emergencies while traveling");
            article3.setContent("Learn how to stay prepared for emergencies...");
            article3.setCategory("TRAVEL_TIPS");
            article3.setSource("Travel Safety Guide");
            article3.setPublishedAt(LocalDateTime.now().minusDays(1));
            article3.setCreatedAt(LocalDateTime.now());
            article3.setUpdatedAt(LocalDateTime.now());
            articles.add(article3);

        } catch (Exception e) {
            System.err.println("Error fetching live articles: " + e.getMessage());
        }

        return articles;
    }

    public Map<String, Object> fetchOnlineArticles(String category, int page, int size) {
        List<Article> articles = new ArrayList<>();

        // In production, fetch from NewsAPI, Google News RSS, or Travel Advisory APIs
        // For demo, return sample articles
        Article article1 = new Article();
        article1.setTitle("Travel Safety Tips for 2024");
        article1.setSummary("Essential safety guidelines for modern travelers");
        article1.setContent("Stay safe while traveling with these essential tips...");
        article1.setCategory(category != null ? category : "SAFETY");
        article1.setSource("Travel Safety News");
        article1.setImageUrl("https://via.placeholder.com/400x300");
        article1.setPublishedAt(LocalDateTime.now());
        articles.add(article1);

        Article article2 = new Article();
        article2.setTitle("Latest Travel Advisories");
        article2.setSummary("Current travel warnings and advisories");
        article2.setContent("Check the latest travel advisories before your trip...");
        article2.setCategory("NEWS");
        article2.setSource("Travel Advisory Service");
        article2.setImageUrl("https://via.placeholder.com/400x300");
        article2.setPublishedAt(LocalDateTime.now().minusHours(2));
        articles.add(article2);

        // Filter by category if provided
        if (category != null && !category.isEmpty()) {
            articles = articles.stream()
                    .filter(a -> a.getCategory().equalsIgnoreCase(category))
                    .collect(java.util.stream.Collectors.toList());
        }

        // Pagination
        int start = page * size;
        int end = Math.min(start + size, articles.size());
        List<Article> paginated = articles.subList(Math.min(start, articles.size()), end);

        Map<String, Object> response = new HashMap<>();
        response.put("articles", paginated);
        response.put("total", articles.size());
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) articles.size() / size));

        return response;
    }

    public List<Article> fetchArticlesNear(Double lat, Double lng, Double radiusMeters) {
        // Use the incident repository via ArticleRepository's knowledge of incidents
        // We'll rely on IncidentRepository through the ArticleService by autowiring it
        // if needed
        try {
            // Attempt to fetch nearby incidents by calling a repository if available
            // To avoid cyclic dependency, ArticleService will call a repository method if
            // injected externally
        } catch (Exception e) {
            // ignore
        }
        return java.util.Collections.emptyList();
    }
}
