package com.veerana.document_service.controller;

import com.veerana.document_service.dto.CreateDocumentRequest;
import com.veerana.document_service.dto.ShareRequest;
import com.veerana.document_service.dto.UpdateDocumentRequest;
import com.veerana.document_service.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService service;

    // =========================
    // CREATE
    // =========================
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateDocumentRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                service.create(email, request)
        );
    }

    // =========================
    // LIST
    // =========================
    @GetMapping
    public ResponseEntity<?> myDocs(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                service.myDocuments(email)
        );
    }

    // =========================
    // UPDATE
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UpdateDocumentRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                service.update(id, email, request)
        );
    }

    // =========================
    // DELETE
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        service.delete(id, email);
        return ResponseEntity.ok("Deleted successfully");
    }

    // =========================
    // SHARE
    // =========================
    @PostMapping("/{id}/share")
    public ResponseEntity<?> share(
            @PathVariable String id,
            @RequestBody ShareRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        service.share(id, email, request);
        return ResponseEntity.ok("Shared successfully");
    }
}