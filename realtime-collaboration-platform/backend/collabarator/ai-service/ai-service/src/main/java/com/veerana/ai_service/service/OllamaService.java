package com.veerana.ai_service.service;

import com.veerana.ai_service.dto.AiResponse;
import com.veerana.ai_service.exception.AiProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OllamaService {

    /**
     * Spring AI auto-configures ChatClient from application.properties:
     *   spring.ai.ollama.base-url=http://localhost:11434
     *   spring.ai.ollama.chat.model=llama3.2
     */
    private final ChatClient chatClient;

    // =========================
    // SUMMARIZE
    // =========================
    public AiResponse summarize(String content) {
        validateContent(content);

        String prompt = """
                You are a precise document summarizer.

                Summarize the following document in 3-5 clear, concise sentences.
                Focus on the main points and key information only.
                Do NOT include any introduction like "Here is a summary" — write the summary directly.

                Document:
                %s
                """.formatted(content.trim());

        try {
            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.info("Summarize completed — input {} chars, output {} chars",
                    content.length(), result.length());

            return new AiResponse(result.trim(), null, "summary");

        } catch (Exception e) {
            log.error("Summarize failed", e);
            throw new AiProcessingException(
                    "Summarization failed. Make sure Ollama is running: ollama serve", e);
        }
    }

    // =========================
    // REWRITE
    // =========================
    public AiResponse rewrite(String content) {
        validateContent(content);

        String prompt = """
                You are a professional editor and writing assistant.

                Rewrite the following text to be clearer, more professional, and better structured.
                - Preserve all original meaning and information
                - Improve grammar, flow, and readability
                - Do NOT add a preamble — return only the rewritten text

                Original text:
                %s
                """.formatted(content.trim());

        try {
            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            log.info("Rewrite completed — input {} chars, output {} chars",
                    content.length(), result.length());

            return new AiResponse(result.trim(), null, "rewrite");

        } catch (Exception e) {
            log.error("Rewrite failed", e);
            throw new AiProcessingException(
                    "Rewrite failed. Make sure Ollama is running: ollama serve", e);
        }
    }

    // =========================
    // AUTO-TAG
    // =========================
    public AiResponse autoTag(String content) {
        validateContent(content);

        String prompt = """
                You are a document categorization assistant.

                Analyze the following document and generate 3-7 relevant tags that describe its topics.

                Rules:
                - Return ONLY a comma-separated list of tags, nothing else
                - Each tag must be 1-3 words
                - All tags must be lowercase
                - No punctuation except commas and hyphens
                - Good example output: project management, team collaboration, q3 planning, budget review

                Document:
                %s
                """.formatted(content.trim());

        try {
            String result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            List<String> tags = Arrays.stream(result.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(t -> !t.isBlank() && t.length() <= 50)
                    .limit(10)
                    .collect(Collectors.toList());

            log.info("Auto-tag completed — generated {} tags", tags.size());

            return new AiResponse(null, tags, "tags");

        } catch (Exception e) {
            log.error("Auto-tag failed", e);
            throw new AiProcessingException(
                    "Auto-tagging failed. Make sure Ollama is running: ollama serve", e);
        }
    }

    // =========================
    // VALIDATION
    // =========================
    private void validateContent(String content) {
        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Document content cannot be empty");
        }
        // Most local Ollama models have a 4k–8k context window
        if (content.length() > 12000) {
            throw new IllegalArgumentException(
                    "Document too long (max 12,000 characters). Select a portion of the text and try again."
            );
        }
    }
}