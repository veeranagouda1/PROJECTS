package com.veerana.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @Size(max = 200, message = "Bio cannot exceed 200 characters")
        private String bio;

        @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
        private String phone;
}