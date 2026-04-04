package com.veerana.user_service.controller;

import com.veerana.user_service.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user/test")
    public String userTest(Authentication authentication) {
        return "FROM USER SERVICE: " + authentication.getName();
    }

    @GetMapping("/admin/test")
    public String adminTest(Authentication authentication) {
        return "Hello ADMIN: " + authentication.getName();
    }
}