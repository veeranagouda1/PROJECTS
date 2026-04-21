package com.veerana.collaboration_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate; // ✅ FIX: use StringRedisTemplate explicitly
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PresenceService {

    // ✅ FIX: inject StringRedisTemplate directly instead of RedisTemplate<String, String>
    // Spring auto-configures a StringRedisTemplate bean — consistent with the
    // RedisTemplate<String, CollabMessage> bean in RedisConfig (no conflict)
    private final StringRedisTemplate stringRedisTemplate;

    private String presenceKey(String documentId) {
        return "presence:" + documentId;
    }

    public void userJoined(String documentId, String email) {
        stringRedisTemplate.opsForSet().add(presenceKey(documentId), email);
        stringRedisTemplate.expire(presenceKey(documentId), Duration.ofHours(1));
    }

    public void userLeft(String documentId, String email) {
        stringRedisTemplate.opsForSet().remove(presenceKey(documentId), email);
    }

    public Set<String> getPresence(String documentId) {
        Set<String> members = stringRedisTemplate.opsForSet().members(presenceKey(documentId));
        return members != null ? members : Collections.emptySet(); // ✅ FIX: never return null
    }
}