package com.veerana.collaboration_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veerana.collaboration_service.dto.CollabMessage;
import com.veerana.collaboration_service.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Slf4j
@Component
@RequiredArgsConstructor
public class CollabWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final RedisTemplate<String, CollabMessage> redisTemplate;
    private final RedisMessageListenerContainer listenerContainer;
    private final PresenceService presenceService;

    // documentId → set of active WebSocket sessions
    private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

    // sessionId → documentId
    private final Map<String, String> sessionRooms = new ConcurrentHashMap<>();

    // sessionId → email
    private final Map<String, String> sessionEmails = new ConcurrentHashMap<>();

    // documentId → Redis listener (one per document room)
    private final Map<String, MessageListener> listeners = new ConcurrentHashMap<>();

    // =========================
    // CONNECTION OPENED
    // =========================
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {

        String documentId = extractDocumentId(session);
        String email      = extractEmail(session);      // ✅ now reads from header

        if (documentId == null || email == null || email.isBlank()) {
            log.warn("Rejected WS connection — missing documentId or email. documentId={}", documentId);
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        // Add to in-memory room
        rooms.computeIfAbsent(documentId, k -> new CopyOnWriteArraySet<>()).add(session);
        sessionRooms.put(session.getId(), documentId);
        sessionEmails.put(session.getId(), email);

        // Presence in Redis
        presenceService.userJoined(documentId, email);

        // Subscribe to Redis channel for this document (idempotent)
        subscribeToRedisChannel(documentId);

        // Broadcast JOIN to room
        CollabMessage joinMsg = CollabMessage.builder()
                .type("JOIN")
                .documentId(documentId)
                .userEmail(email)
                .content(email + " joined")
                .timestamp(System.currentTimeMillis())
                .build();
        publishToRedis(documentId, joinMsg);

        // Send current presence list only to the joining user
        Set<String> present = presenceService.getPresence(documentId);
        CollabMessage presenceMsg = CollabMessage.builder()
                .type("PRESENCE")
                .documentId(documentId)
                .userEmail(email)
                .content(String.join(",", present))
                .timestamp(System.currentTimeMillis())
                .build();
        sendToSession(session, presenceMsg);

        log.info("User {} joined document {}", email, documentId);
    }

    // =========================
    // MESSAGE RECEIVED
    // =========================
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {

        String documentId = sessionRooms.get(session.getId());
        String email      = sessionEmails.get(session.getId());

        if (documentId == null || email == null) return;

        CollabMessage msg = objectMapper.readValue(message.getPayload(), CollabMessage.class);

        // Override with server-trusted values — client cannot spoof these
        msg.setDocumentId(documentId);
        msg.setUserEmail(email);
        msg.setTimestamp(System.currentTimeMillis());

        publishToRedis(documentId, msg);
    }

    // =========================
    // CONNECTION CLOSED
    // =========================
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {

        String documentId = sessionRooms.remove(session.getId());
        String email      = sessionEmails.remove(session.getId());

        if (documentId == null) return;

        Set<WebSocketSession> room = rooms.get(documentId);
        if (room != null) {
            room.remove(session);
            if (room.isEmpty()) {
                rooms.remove(documentId);
                unsubscribeFromRedisChannel(documentId);
            }
        }

        if (email != null) {
            presenceService.userLeft(documentId, email);

            CollabMessage leaveMsg = CollabMessage.builder()
                    .type("LEAVE")
                    .documentId(documentId)
                    .userEmail(email)
                    .content(email + " left")
                    .timestamp(System.currentTimeMillis())
                    .build();
            publishToRedis(documentId, leaveMsg);
        }

        log.info("User {} left document {}", email, documentId);
    }

    // =========================
    // REDIS PUB/SUB
    // =========================
    private void publishToRedis(String documentId, CollabMessage msg) {
        redisTemplate.convertAndSend("collab:" + documentId, msg);
    }

    private void subscribeToRedisChannel(String documentId) {
        // computeIfAbsent makes this atomic — fixes the race condition
        listeners.computeIfAbsent(documentId, key -> {
            MessageListener listener = (message, pattern) -> {
                try {
                    CollabMessage msg = objectMapper.readValue(message.getBody(), CollabMessage.class);
                    broadcastToRoom(documentId, msg);
                } catch (Exception e) {
                    log.error("Error processing Redis message for document {}", documentId, e);
                }
            };
            listenerContainer.addMessageListener(listener, new ChannelTopic("collab:" + documentId));
            return listener;
        });
    }

    private void unsubscribeFromRedisChannel(String documentId) {
        MessageListener listener = listeners.remove(documentId);
        if (listener != null) {
            listenerContainer.removeMessageListener(listener);
        }
    }

    // =========================
    // BROADCAST TO ROOM
    // =========================
    private void broadcastToRoom(String documentId, CollabMessage msg) {
        Set<WebSocketSession> room = rooms.get(documentId);
        if (room == null) return;
        room.forEach(s -> sendToSession(s, msg));
    }

    private void sendToSession(WebSocketSession session, CollabMessage msg) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(msg)));
            }
        } catch (IOException e) {
            log.error("Error sending to session {}", session.getId(), e);
        }
    }

    // =========================
    // HELPERS
    // =========================
    private String extractDocumentId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;
        // path: /ws/collab/{documentId}
        String[] parts = uri.getPath().split("/");
        return parts.length >= 4 ? parts[3] : null;
    }

    /**
     * ✅ SECURITY FIX: reads email from X-User-Email header injected by the gateway.
     * The gateway validates the JWT and sets this header — clients cannot forge it
     * because the gateway strips any client-supplied X-User-Email before forwarding.
     *
     * Falls back to null (connection is rejected) if header is absent.
     */
    private String extractEmail(WebSocketSession session) {
        List<String> values = session.getHandshakeHeaders().get("X-User-Email");
        if (values == null || values.isEmpty()) return null;
        String email = values.get(0);
        return (email != null && !email.isBlank()) ? email : null;
    }
}