package com.travelplanner.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private boolean success = false;
    private String message;
    private String error;
    
    public ErrorResponse(String message) {
        this.success = false;
        this.message = message;
        this.error = message;
    }
}

