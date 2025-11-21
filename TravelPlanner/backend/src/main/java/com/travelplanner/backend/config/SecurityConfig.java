package com.travelplanner.backend.config;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.travelplanner.backend.security.CustomUserDetailsService;
import com.travelplanner.backend.security.JwtAuthenticationFilter;
import com.travelplanner.backend.security.OAuth2SuccessHandler;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private final ObjectProvider<OAuth2SuccessHandler> oAuth2SuccessHandlerProvider;

    public SecurityConfig(ObjectProvider<OAuth2SuccessHandler> oAuth2SuccessHandlerProvider) {
        this.oAuth2SuccessHandlerProvider = oAuth2SuccessHandlerProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        OAuth2SuccessHandler handler = oAuth2SuccessHandlerProvider.getIfAvailable();
        
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(auth -> auth

                // ---------- PUBLIC ENDPOINTS ----------
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/articles/public/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()

                // ---------- USER + POLICE + ADMIN ----------
                .requestMatchers("/api/trips/**").hasAnyRole("TRAVELER", "POLICE", "ADMIN")
                .requestMatchers("/api/budget/**").hasAnyRole("TRAVELER", "POLICE", "ADMIN")
                .requestMatchers("/api/sos/**").hasAnyRole("TRAVELER", "POLICE", "ADMIN")
                .requestMatchers("/api/emergency/**").hasAnyRole("TRAVELER", "POLICE", "ADMIN")
                .requestMatchers("/api/geofence/**").hasAnyRole("TRAVELER", "POLICE", "ADMIN")

                // ---------- ADMIN ONLY ----------
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Everything else → must be authenticated
                .anyRequest().authenticated()
            );

        if (handler != null) {
            http.oauth2Login(oauth2 -> oauth2.successHandler(handler));
        }

        http.authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        config.addExposedHeader("Authorization");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
