package com.veerana.document_service.repository;

import com.veerana.document_service.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, String> {

    List<Document> findByOwnerEmail(String ownerEmail);

    // ✅ NEW: fetch all documents belonging to a team
    List<Document> findByTeamId(String teamId);
}