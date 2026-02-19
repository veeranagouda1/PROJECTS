package com.veerana.collaboration.auth.security;

import java.security.Key;
import java.util.Date;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    private static final String SECRET = "THIS_IS_A_VERY_SECURE_256_BIT_SECRET_KEY_123456";

    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    // ===================== LOCAL LOGIN =====================
    public String generateToken(UserDetails userDetails) {
        return generateTokenFromEmail(userDetails.getUsername());
    }

    // ===================== GOOGLE OAUTH =====================
    public String generateTokenFromEmail(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ===================== VALIDATION =====================
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return extractUsername(token)
                .equals(userDetails.getUsername());
    }
}
