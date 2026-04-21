package com.veerana.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AiResponse {

    private String result;       // for summarize + rewrite — the AI output text
    private List<String> tags;   // for auto-tag — list of tag strings
    private String type;         // "summary" | "rewrite" | "tags"
}