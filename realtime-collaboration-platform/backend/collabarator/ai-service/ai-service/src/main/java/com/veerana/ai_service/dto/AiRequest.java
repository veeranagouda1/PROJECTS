package com.veerana.ai_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiRequest {

    @NotBlank(message = "Content is required")
    private String content;     // document text to process

    private String documentId;  // optional, for logging/context
}