package com.veerana.document_service.dto;

import java.time.LocalDateTime;

public record DocumentResponse(
        String id,
        String title,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}