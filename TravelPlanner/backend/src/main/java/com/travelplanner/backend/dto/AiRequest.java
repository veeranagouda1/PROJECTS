package com.travelplanner.backend.dto;

import lombok.Data;

@Data
public class AiRequest {
    private String message;
    private String context;
}

