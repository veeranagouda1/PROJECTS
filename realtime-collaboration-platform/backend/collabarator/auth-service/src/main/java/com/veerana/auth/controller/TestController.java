package com.veerana.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Protected endpoint working";
    }

    @GetMapping("/admin/test")
    public String adminTest() {
        return "Admin OK";
    }

    @GetMapping("/user/test")
    public String userTest() {
        return "User OK";
    }
}