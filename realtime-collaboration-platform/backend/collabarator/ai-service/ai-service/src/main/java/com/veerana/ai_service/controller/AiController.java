package com.veerana.ai_service.controller;

import com.veerana.ai_service.dto.AiRequest;
import com.veerana.ai_service.dto.AiResponse;
import com.veerana.ai_service.service.OllamaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final OllamaService ollamaService;

    // POST /api/ai/summarize
    // Body: { "content": "...", "documentId": "optional" }
    @PostMapping("/summarize")
    public ResponseEntity<AiResponse> summarize(
            @Valid @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(ollamaService.summarize(request.getContent()));
    }

    // POST /api/ai/rewrite
    // Body: { "content": "...", "documentId": "optional" }
    @PostMapping("/rewrite")
    public ResponseEntity<AiResponse> rewrite(
            @Valid @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(ollamaService.rewrite(request.getContent()));
    }

    // POST /api/ai/tag
    // Body: { "content": "...", "documentId": "optional" }
    @PostMapping("/tag")
    public ResponseEntity<AiResponse> tag(
            @Valid @RequestBody AiRequest request
    ) {
        return ResponseEntity.ok(ollamaService.autoTag(request.getContent()));
    }
}