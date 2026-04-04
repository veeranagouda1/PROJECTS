package com.veerana.document_service.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateDocumentRequest(
        @NotBlank String title,
        String content
) {}