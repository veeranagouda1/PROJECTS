package com.travelplanner.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.model.Article;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    List<Article> findByCategoryOrderByPublishedAtDesc(String category);

    List<Article> findAllByOrderByPublishedAtDesc();

    List<Article> findByIncidentId(Long incidentId);

    List<Article> findByUrl(String url);
}
