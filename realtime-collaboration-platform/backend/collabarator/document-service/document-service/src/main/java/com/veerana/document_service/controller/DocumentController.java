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

    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody CreateDocumentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.create(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<?> myDocs(Authentication authentication) {
        return ResponseEntity.ok(service.myDocuments(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.getById(id, authentication.getName()));
    }

    // ✅ NEW: get all documents for a team
    // Frontend calls this when user views a team's documents
    @GetMapping("/team/{teamId}")
    public ResponseEntity<?> getByTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(service.getByTeam(teamId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable String id,
            @RequestBody UpdateDocumentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(service.update(id, authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            Authentication authentication
    ) {
        service.delete(id, authentication.getName());
        return ResponseEntity.ok("Deleted successfully");
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> share(
            @PathVariable String id,
            @RequestBody ShareRequest request,
            Authentication authentication
    ) {
        service.share(id, authentication.getName(), request);
        return ResponseEntity.ok("Shared successfully");
    }
}