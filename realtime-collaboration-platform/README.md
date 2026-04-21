# CollabX — Real-Time Collaboration Platform

A distributed, AI-powered document collaboration platform built with a microservices architecture. Think Notion + Figma — real-time editing, team management, and AI assistance, all running as independent services.

---

## Architecture Overview

```
Frontend (React + Redux)
        │
        ▼
┌─────────────────┐
│  API Gateway    │  :8080  — JWT validation, routing, CORS, identity forwarding
└────────┬────────┘
         │
    ┌────┴─────────────────────────────────────────┐
    │                                              │
    ▼                ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │ Document │  │   Team   │  │   User   │
│ Service  │  │ Service  │  │ Service  │  │ Service  │
│  :8081   │  │  :8082   │  │  :8083   │  │  :8084   │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │              │              │              │
  Postgres       Postgres       Postgres       Postgres
  (authdb)     (documentdb)    (teamdb)       (userdb)

    ▼                                    ▼
┌──────────┐                      ┌──────────┐
│    AI    │                      │  Collab  │
│ Service  │                      │ Service  │
│  :8085   │                      │  :8086   │
└────┬─────┘                      └────┬─────┘
     │                                 │
  Ollama                             Redis
(llama3.2)                         (Pub/Sub +
                                    Presence)
```

---

## Services

| Service | Port | Description |
|---------|------|-------------|
| `gateway-service` | 8080 | Spring Cloud Gateway — single entry point, JWT validation, routing |
| `auth-service` | 8081 | Register, login, Google OAuth, RS256 JWT, refresh tokens |
| `document-service` | 8082 | Document CRUD, permissions (OWNER/EDITOR/VIEWER), team linking |
| `team-service` | 8083 | Team management, member roles (OWNER/ADMIN/MEMBER), invites |
| `user-service` | 8084 | User profiles (name, bio, phone) |
| `ai-service` | 8085 | Spring AI + Ollama — summarize, rewrite, auto-tag |
| `collaboration-service` | 8086 | WebSocket real-time editing, Redis pub/sub, presence tracking |

---

## Tech Stack

**Backend**
- Java 17
- Spring Boot (3.5.11)
- Spring Security, OAuth2 Resource Server (RS256 JWT)
- Spring Cloud Gateway (reactive)
- Spring Data JPA + PostgreSQL (one DB per service)
- Spring AI + Ollama (llama3.2)
- Spring WebSocket + Redis pub/sub
- Lombok, Maven

**Frontend**
- React 18, Vite
- Redux Toolkit (auth state)
- React Router v6
- Axios (with silent token refresh interceptor)
- Google Identity Services (OAuth)

**Infrastructure**
- Docker + Docker Compose
- Redis 7
- PostgreSQL 16 (5 independent instances)
- Ollama (local LLM runtime)

---

## Key Features

- **Real-time collaboration** — Multiple users edit the same document simultaneously. Changes broadcast via WebSocket, scaled across instances using Redis pub/sub.
- **Presence tracking** — See who's currently in a document. Join/leave events shown live.
- **Role-based access control** — Two-level RBAC: system roles (USER/ADMIN) + document roles (OWNER/EDITOR/VIEWER) + team roles (OWNER/ADMIN/MEMBER).
- **Google OAuth** — Sign in with Google via GSI. Verified server-side using Google ID token.
- **AI features** — Summarize documents, rewrite for clarity, auto-generate tags. Powered by Ollama running llama3.2 locally.
- **Team → Document linking** — Documents can be personal or attached to a team. Team members see all team documents grouped together.
- **Silent token refresh** — Access tokens refresh automatically in the background. Users are never kicked out unexpectedly.
- **Asymmetric JWT** — Auth service signs with RS256 private key. All other services verify with the shared public key — no shared secret.

---

## Getting Started

### Prerequisites
- Java 17
- Maven
- Docker Desktop
- Node.js 18+
- Ollama (`https://ollama.com`)

### 1. Generate RSA key pair (one time)
```bash
# In auth-service/src/main/resources/keys/
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
# Convert private key to PKCS8
openssl pkcs8 -topk8 -inform PEM -in private.pem -out private_pkcs8.pem -nocrypt
mv private_pkcs8.pem private.pem

# Copy public.pem to every other service's src/main/resources/keys/
```

### 2. Build all services
```bash
# Run in each service directory
cd auth-service         && mvn clean package -DskipTests && cd ..
cd document-service     && mvn clean package -DskipTests && cd ..
cd team-service         && mvn clean package -DskipTests && cd ..
cd user-service         && mvn clean package -DskipTests && cd ..
cd collaboration-service && mvn clean package -DskipTests && cd ..
cd ai-service           && mvn clean package -DskipTests && cd ..
cd gateway-service      && mvn clean package -DskipTests && cd ..
```

### 3. Start everything
```bash
docker-compose up --build
```

### 4. Start Ollama (if not using Docker for it)
```bash
ollama serve
ollama pull llama3.2
```

### 5. Start frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## API Endpoints

### Auth Service (`/api/auth`)
```
POST /api/auth/register        Register with email + password
POST /api/auth/login           Login with email + password
POST /api/auth/google          Login with Google ID token
POST /api/auth/refresh         Refresh access token
POST /api/auth/logout          Invalidate refresh token
```

### Document Service (`/api/documents`)
```
GET    /api/documents              List my documents
POST   /api/documents              Create document
GET    /api/documents/{id}         Get document by ID
PUT    /api/documents/{id}         Update document content
DELETE /api/documents/{id}         Delete document
POST   /api/documents/{id}/share   Share with another user
GET    /api/documents/team/{teamId} Get all documents for a team
```

### Team Service (`/api/teams`)
```
GET    /api/teams                          List my teams
POST   /api/teams                          Create team
GET    /api/teams/{id}/members             Get team members
POST   /api/teams/{id}/members             Invite member
DELETE /api/teams/{id}/members/{email}     Remove member
DELETE /api/teams/{id}                     Delete team
```

### User Service (`/api/user`)
```
GET  /api/user/profile    Get my profile
PUT  /api/user/profile    Update profile (name, bio, phone)
```

### AI Service (`/api/ai`)
```
POST /api/ai/summarize    Summarize document content
POST /api/ai/rewrite      Rewrite for clarity
POST /api/ai/tag          Generate topic tags
```

### Collaboration Service (WebSocket)
```
WS /ws/collab/{documentId}?email={email}

Message types:
  JOIN      — user joined the document room
  LEAVE     — user left
  EDIT      — content change (broadcast to all in room)
  PRESENCE  — current users in room (sent on join)
  CURSOR    — cursor position (optional, extensible)
```

---

## Project Structure

```
realtime-collaboration-platform/
├── docker-compose.yml
├── README.md
├── auth-service/
├── document-service/
├── team-service/
├── user-service/
├── collaboration-service/
├── ai-service/
├── gateway-service/
└── frontend/
    └── src/
        ├── app/           store.js
        ├── components/    AuthModal, Navbar, Hero, AiPanel, ...
        ├── features/auth/ authSlice.js
        ├── pages/         Landing, Dashboard, Editor, AdminDashboard
        └── services/      api.js, jwtUtils.js
```

---

## Design Decisions

**Why one database per service?** Each service owns its data. This prevents tight coupling, allows independent scaling, and is the core principle of true microservices. Cross-service data needs (e.g. "which team does this document belong to?") are resolved by storing foreign IDs, not by joining across databases.

**Why Redis for collaboration?** WebSocket connections are stateful and bound to a single server instance. Redis pub/sub lets multiple collaboration-service instances share messages — any instance can receive a WebSocket message and broadcast it to all connected clients across all instances.

**Why RS256 JWT?** Asymmetric signing means only the auth-service needs the private key. All other services only need the public key to verify tokens — they can never issue tokens, only validate them.

**Why Ollama?** Free, local, no API costs, no data sent externally. Suitable for development and demo. Can be swapped for OpenAI or Claude by changing the Spring AI provider in application.properties.