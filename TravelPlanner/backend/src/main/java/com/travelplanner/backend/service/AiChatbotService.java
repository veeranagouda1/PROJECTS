package com.travelplanner.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiChatbotService {

    @Value("${ai.api.key}")
    private String apiKey;

    @Value("${ai.model:gemini-2.5-flash}")
    private String model;

    private final WebClient webClient;

    public AiChatbotService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getChatResponse(String userMessage, String context) {
        try {
            String url = String.format("/models/%s:generateContent?key=%s", model, apiKey);

            // Build request body correctly
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> part = new HashMap<>();
            part.put("text", buildPrompt(userMessage, context));

            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(part));

            requestBody.put("contents", List.of(content));

            // Send request
            Map<String, Object> response =
                    webClient.post()
                            .uri(url)
                            .bodyValue(requestBody)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

            if (response == null || !response.containsKey("candidates"))
                return "Sorry, I couldn't generate a response.";

            // Parse Gemini response correctly
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates.isEmpty()) return "No response received.";

            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> contentResponse = (Map<String, Object>) candidate.get("content");

            List<Map<String, Object>> parts = (List<Map<String, Object>>) contentResponse.get("parts");
            if (parts.isEmpty()) return "No content returned.";

            return parts.get(0).get("text").toString();

        } catch (Exception e) {
            e.printStackTrace();
            return "I'm experiencing technical difficulties. Please try again later.";
        }
    }

    public String chat(com.travelplanner.backend.dto.AiRequest request) {
        return getChatResponse(request.getMessage(), request.getContext());
    }

    private String buildPrompt(String userMessage, String context) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are a helpful travel assistant. Provide practical, accurate, and friendly travel guidance.\n\n");

        if (context != null && !context.isEmpty())
            prompt.append("Conversation history:\n").append(context).append("\n\n");

        prompt.append("User: ").append(userMessage).append("\n");
        prompt.append("Assistant:");

        return prompt.toString();
    }
}
