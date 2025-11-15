package com.travelplanner.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.model.Article;
import com.travelplanner.backend.service.ArticleService;
import java.util.Map;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "*")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles() {
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Article>> getArticlesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(articleService.getArticlesByCategory(category));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Article>> getPublicArticles() {
        return ResponseEntity.ok(articleService.getAllArticles());
    }

    @PostMapping
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        return ResponseEntity.ok(articleService.createArticle(article));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody Article article) {
        return ResponseEntity.ok(articleService.updateArticle(id, article));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/live")
    public ResponseEntity<List<Article>> getLiveArticles() {
        return ResponseEntity.ok(articleService.fetchLiveArticles());
    }

    @GetMapping("/online")
    public ResponseEntity<Map<String, Object>> getOnlineArticles(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(articleService.fetchOnlineArticles(category, page, size));
    }
}

