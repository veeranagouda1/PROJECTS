package com.veerana.collaboration_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollabMessage {

    // Type of message: JOIN | LEAVE | EDIT | CURSOR | PRESENCE
    private String type;

    // Document room this message belongs to
    private String documentId;

    // Who sent it (email from JWT)
    private String userEmail;

    // Actual content (for EDIT: the changed text, for CURSOR: position)
    private String content;

    // Timestamp
    private long timestamp;
}