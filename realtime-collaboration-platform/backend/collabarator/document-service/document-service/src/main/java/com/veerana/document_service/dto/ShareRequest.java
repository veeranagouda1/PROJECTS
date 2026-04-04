package com.veerana.document_service.dto;

import com.veerana.document_service.model.Role;
import lombok.Data;

@Data
public class ShareRequest {
    private String email;
    private Role role;
}