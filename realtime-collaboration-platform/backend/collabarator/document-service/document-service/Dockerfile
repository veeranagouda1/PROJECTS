# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — use this SAME file in every Spring Boot service folder.
# Just copy it into: auth-service/, document-service/, team-service/,
#                    user-service/, collaboration-service/, ai-service/,
#                    gateway-service/
#
# Build the jar first:
#   mvn clean package -DskipTests
# Then Docker Compose handles the rest.
# ─────────────────────────────────────────────────────────────────────────────

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the fat jar produced by mvn package
COPY target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]