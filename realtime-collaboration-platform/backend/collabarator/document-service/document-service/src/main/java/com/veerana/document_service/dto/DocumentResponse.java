package com.veerana.document_service.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        String id,
        String title,
        String content,
        String ownerEmail,
        String teamId,          // ✅ NEW: null if personal document
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}