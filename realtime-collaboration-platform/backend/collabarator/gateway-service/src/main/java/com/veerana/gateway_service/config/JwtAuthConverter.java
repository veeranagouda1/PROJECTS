package com.veerana.gateway_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Configuration
public class JwtAuthConverter {

    @Bean
    public Converter<Jwt, Mono<AbstractAuthenticationToken>> jwtAuthenticationConverter() {

        return jwt -> {

            String role = jwt.getClaimAsString("role");

            if (role == null) {
                return Mono.error(new RuntimeException("Role claim missing in token"));
            }

            AbstractAuthenticationToken authentication =
                    new JwtAuthenticationToken(
                            jwt,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority("ROLE_" + role)
                            )
                    );

            return Mono.just(authentication);
        };
    }
}