package com.travelplanner.backend.dto;

import lombok.Data;

@Data
public class AiRequest {
    private String message;
    private String context;

    // Manual getters since Lombok isn't working
    public String getMessage() {
        return message;
    }

    public String getContext() {
        return context;
    }
}

