# System Architecture – Real-Time Collaboration Platform

## Overview
This system is a real-time collaborative document editing platform inspired by tools like Google Docs.  
It supports multiple users (Owner, Editor, Viewer) editing the same document simultaneously with AI-assisted features.

The architecture is designed as a **modular monolith**, with clear boundaries so it can later evolve into microservices.

---

## High-Level Architecture

Core components:
- Frontend (React)
- API Gateway
- Auth Service
- Document & Collaboration Service
- WebSocket Engine
- AI Assistance Service
- Redis
- PostgreSQL

---

## Component Responsibilities

### 1. Frontend (React)
- User interface
- JWT storage
- WebSocket connection
- Role-based UI controls
- Optimistic updates for edits

---

### 2. API Gateway
Responsibilities:
- Routing requests
- JWT validation
- Rate limiting

All REST requests pass through the gateway.

---

### 3. Auth Service
Responsibilities:
- User login & signup
- Issue JWT tokens
- Token refresh (future)

⚠️ This service does NOT handle business logic.

---

### 4. Document & Collaboration Service
Responsibilities:
- Document CRUD operations
- Version history management
- Permission enforcement (Owner / Editor / Viewer)
- AI request orchestration

Database:
- PostgreSQL (source of truth)

---

### 5. WebSocket Engine
Responsibilities:
- Real-time edit operations
- Presence tracking
- Broadcasting updates to collaborators
- JWT validation on connection
- Role check before applying edits

Scaling support:
- Redis Pub/Sub

---

### 6. Redis
Used for:
- Active WebSocket sessions
- User presence
- Pub/Sub for horizontal scaling

Redis is NOT used as a primary database.

---

### 7. AI Assistance Service
Responsibilities:
- Document summarization
- Text rewrite
- Context-based Q&A

Design principles:
- Asynchronous processing
- Human-in-the-loop (user approves AI output)
- External AI API isolated from core services

---

## Data Storage

### PostgreSQL (Primary Database)
Tables:
- Users
- Documents
- DocumentVersions
- Teams
- Permissions

---

## Request Flows

### REST Flow
User → API Gateway → Document Service → Database

shell
Copy code

### WebSocket Flow
User → WebSocket Engine
→ JWT validation (on connect)
→ Role check (on edit)
→ Broadcast updates

shell
Copy code

### AI Flow
User → Document Service → AI Service → External AI API

yaml
Copy code

---

## Design Decisions & Trade-offs

- Used JWT instead of session-based auth for scalability
- Chose WebSockets over polling for real-time updates
- AI requests are async to avoid blocking collaboration
- Modular monolith chosen to reduce operational complexity

---

## Future Improvements
- Microservices split (Auth, Collaboration, AI)
- Offline editing support
- CRDT-based conflict resolution
- Advanced monitoring & alerting
