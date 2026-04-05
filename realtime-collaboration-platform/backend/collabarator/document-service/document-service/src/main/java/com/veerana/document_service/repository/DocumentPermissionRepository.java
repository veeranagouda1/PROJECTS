package com.veerana.document_service.repository;

import com.veerana.document_service.model.DocumentPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

public interface DocumentPermissionRepository
        extends JpaRepository<DocumentPermission, String> {

    Optional<DocumentPermission> findByDocumentIdAndUserEmail(
            String documentId,
            String userEmail
    );

    List<DocumentPermission> findByUserEmail(String userEmail);

    @Transactional  // ✅ FIX: required for delete derived queries
    void deleteByDocumentId(String documentId);
}