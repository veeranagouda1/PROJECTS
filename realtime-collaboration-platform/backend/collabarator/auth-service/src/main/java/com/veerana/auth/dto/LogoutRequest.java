package com.veerana.auth.dto;

import lombok.Data;

@Data
public class LogoutRequest {
    private String refreshToken;
}