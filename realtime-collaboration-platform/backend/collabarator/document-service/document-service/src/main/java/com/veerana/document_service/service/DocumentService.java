package com.veerana.document_service.service;

import com.veerana.document_service.dto.CreateDocumentRequest;
import com.veerana.document_service.dto.DocumentResponse;
import com.veerana.document_service.dto.ShareRequest;
import com.veerana.document_service.dto.UpdateDocumentRequest;
import com.veerana.document_service.exception.AccessDeniedException;
import com.veerana.document_service.exception.ResourceNotFoundException;
import com.veerana.document_service.model.Document;
import com.veerana.document_service.model.DocumentPermission;
import com.veerana.document_service.model.Role;
import com.veerana.document_service.repository.DocumentPermissionRepository;
import com.veerana.document_service.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentPermissionRepository permissionRepository;

    // =========================
    // CREATE DOCUMENT
    // =========================
    public DocumentResponse create(String email,
                                   CreateDocumentRequest request) {

        Document doc = Document.builder()
                .title(request.title())
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        documentRepository.save(doc);

        // Create OWNER permission
        DocumentPermission ownerPermission =
                DocumentPermission.builder()
                        .documentId(doc.getId())
                        .userEmail(email)
                        .role(Role.OWNER)
                        .build();

        permissionRepository.save(ownerPermission);

        return map(doc);
    }

    // =========================
    // LIST MY DOCUMENTS
    // =========================
    public List<DocumentResponse> myDocuments(String email) {

        List<DocumentPermission> permissions =
                permissionRepository.findByUserEmail(email);

        List<String> documentIds = permissions.stream()
                .map(DocumentPermission::getDocumentId)
                .toList();

        return documentRepository.findAllById(documentIds)
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================
    // UPDATE DOCUMENT
    // =========================
    public DocumentResponse update(String documentId,
                                   String email,
                                   UpdateDocumentRequest request) {

        DocumentPermission permission =
                getPermission(documentId, email);

        if (permission.getRole() == Role.VIEWER) {
            throw new AccessDeniedException("No edit permission");
        }

        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        doc.setContent(request.getContent());
        doc.setUpdatedAt(LocalDateTime.now());

        documentRepository.save(doc);

        return map(doc);
    }

    // =========================
    // DELETE DOCUMENT
    // =========================
    public void delete(String documentId, String email) {

        DocumentPermission permission =
                getPermission(documentId, email);

        if (permission.getRole() != Role.OWNER) {
            throw new AccessDeniedException("Only owner can delete document");
        }

        documentRepository.deleteById(documentId);
        permissionRepository.deleteByDocumentId(documentId);
    }

    // =========================
    // SHARE DOCUMENT
    // =========================
    public void share(String documentId,
                      String ownerEmail,
                      ShareRequest request) {

        DocumentPermission ownerPermission =
                getPermission(documentId, ownerEmail);

        if (ownerPermission.getRole() != Role.OWNER) {
            throw new AccessDeniedException("Only owner can share document");
        }

        permissionRepository
                .findByDocumentIdAndUserEmail(documentId, request.getEmail())
                .ifPresent(p -> {
                    throw new AccessDeniedException("User already has access");
                });

        DocumentPermission permission =
                DocumentPermission.builder()
                        .documentId(documentId)
                        .userEmail(request.getEmail())
                        .role(request.getRole())
                        .build();

        permissionRepository.save(permission);
    }

    // =========================
    // HELPER
    // =========================
    private DocumentPermission getPermission(String documentId,
                                             String email) {

        return permissionRepository
                .findByDocumentIdAndUserEmail(documentId, email)
                .orElseThrow(() -> new AccessDeniedException("Access denied"));
    }

    private DocumentResponse map(Document doc) {
        return new DocumentResponse(
                doc.getId(),
                doc.getTitle(),
                doc.getContent(),
                doc.getCreatedAt(),
                doc.getUpdatedAt()
        );
    }
}