package com.veerana.document_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDocumentRequest(
        @NotBlank String title,
        String content,
        String teamId   // ✅ NEW: optional — null means personal document
) {}