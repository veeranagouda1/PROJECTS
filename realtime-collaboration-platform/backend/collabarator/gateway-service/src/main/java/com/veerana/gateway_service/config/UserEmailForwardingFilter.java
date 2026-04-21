package com.veerana.gateway_service.config;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class UserEmailForwardingFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .cast(JwtAuthenticationToken.class)
                .map(auth -> {
                    Jwt jwt = auth.getToken();
                    // sub = email (set via .setSubject(email) in JwtService)
                    String email = jwt.getSubject();
                    String role  = jwt.getClaimAsString("role");

                    ServerHttpRequest mutated = exchange.getRequest()
                            .mutate()
                            .header("X-User-Email", email != null ? email : "")
                            .header("X-User-Role",  role  != null ? role  : "")
                            // Strip any client-supplied spoofed headers
                            .headers(h -> h.remove("X-Forwarded-User"))
                            .build();

                    return exchange.mutate().request(mutated).build();
                })
                .defaultIfEmpty(exchange)   // unauthenticated requests pass through unchanged
                .flatMap(chain::filter);
    }

    // Run AFTER Spring Security (order 1) but before routing (order 2)
    @Override
    public int getOrder() {
        return 5;
    }
}