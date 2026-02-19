package com.veerana.collaboration.test;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/owner")
    @PreAuthorize("hasRole('OWNER')")
    public String ownerOnly() {
        return "OWNER access granted";
    }

    @GetMapping("/editor")
    @PreAuthorize("hasRole('EDITOR')")
    public String editorOnly() {
        return "EDITOR access granted";
    }

    @GetMapping("/viewer")
    @PreAuthorize("hasRole('VIEWER')")
    public String viewerOnly() {
        return "VIEWER access granted";
    }
}
