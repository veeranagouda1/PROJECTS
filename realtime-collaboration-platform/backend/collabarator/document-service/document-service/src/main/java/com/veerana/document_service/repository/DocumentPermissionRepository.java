package com.veerana.document_service.repository;

import com.veerana.document_service.model.DocumentPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface DocumentPermissionRepository
        extends JpaRepository<DocumentPermission, String> {

    Optional<DocumentPermission> findByDocumentIdAndUserEmail(
            String documentId,
            String userEmail
    );

    List<DocumentPermission> findByUserEmail(String userEmail);

    void deleteByDocumentId(String documentId);
}