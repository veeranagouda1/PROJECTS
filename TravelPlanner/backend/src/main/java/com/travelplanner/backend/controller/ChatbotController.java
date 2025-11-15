package com.travelplanner.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.travelplanner.backend.dto.AiRequest;
import com.travelplanner.backend.service.AiChatbotService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private AiChatbotService aiChatbotService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody AiRequest request) {
        String response = aiChatbotService.chat(request);

        Map<String, String> result = new HashMap<>();
        // Support both "reply" and "response" for compatibility
        result.put("reply", response);
        result.put("response", response);

        return ResponseEntity.ok(result);
    }
}
