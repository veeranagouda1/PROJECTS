package com.travelplanner.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI travelPlannerOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Development server");

        Contact contact = new Contact();
        contact.setEmail("support@travelplanner.com");
        contact.setName("Travel Planner Support");

        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        Info info = new Info()
                .title("Travel Planner API")
                .version("1.0.0")
                .contact(contact)
                .description("REST API for Travel Planner application. " +
                        "Provides endpoints for trip planning, budget management, " +
                        "SOS alerts, geofencing, and AI-powered travel assistance.")
                .license(license);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer));
    }
}

