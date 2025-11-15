# Travel Planner - Comprehensive Feature Implementation Guide

## 📋 Implementation Phases

### Phase 1: Core SOS + Offline + Emergency Contacts (CURRENT - 2-3 weeks)
- ✅ Offline SOS auto-queue with IndexedDB
- ✅ Emergency Contact management
- ✅ SOS escalation workflow
- ✅ SMS/Email notifications (Twilio + JavaMail)
- ✅ Police dashboard basics

### Phase 2: Geo-fencing + Advanced Analytics (3-4 weeks)
- Geo-Fencing with PostGIS
- Safety zones and heatmaps
- Advanced incident reporting
- Real-time location sharing (WebSocket)

### Phase 3: AI + Premium Features (2-3 weeks)
- AI-powered incident classification (Groq)
- AI chatbot enhancements
- Firebase push notifications
- PDF export & trip sharing
- GDPR/Privacy features

---

## 🔧 Environment Setup

### Backend Prerequisites
```bash
# Required environment variables (.env or application.properties)
AI_API_KEY=your-groq-api-key  # Get from https://console.groq.com
TWILIO_ACCOUNT_SID=your-sid   # Get from https://www.twilio.com
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USERNAME=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
S3_BUCKET_NAME=travel-planner-dev
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=us-east-1
FIREBASE_CONFIG_JSON={"project_id":"your-project",...}
```

### Frontend Prerequisites
```bash
cd frontend
npm install idb framer-motion react-hot-toast axios
npm install bootstrap @popperjs/core
npm install lucide-react  # Icons
npm install react-joyride  # Onboarding
npm install leaflet react-leaflet
```

---

## 📦 Deliverables Structure

```
backend/src/main/java/com/travelplanner/
├── model/
│   ├── OfflineSosEvent.java         [NEW]
│   ├── EmergencyContact.java        [NEW]
│   ├── AuditLog.java                [NEW]
│   ├── GeoZone.java                 [NEW]
│   ├── IncidentReport.java          [NEW]
│   └── UserLocation.java            [NEW]
├── dto/
│   ├── OfflineSosEventDTO.java      [NEW]
│   ├── EmergencyContactDTO.java     [NEW]
│   ├── AIClassificationDTO.java     [NEW]
│   └── SosEscalationDTO.java        [NEW]
├── service/
│   ├── OfflineSosService.java       [NEW]
│   ├── EmergencyContactService.java [NEW]
│   ├── NotificationService.java     [NEW]
│   ├── SmsService.java              [NEW]
│   ├── EmailService.java            [NEW]
│   ├── AIService.java               [NEW]
│   └── GeoFencingService.java       [NEW]
├── controller/
│   ├── OfflineSosController.java    [NEW]
│   ├── EmergencyContactController.java [NEW]
│   ├── PoliceDashboardController.java  [NEW]
│   └── GeoZoneController.java       [NEW]
└── security/
    └── JwtTokenProvider.java        [UPDATE]

frontend/src/
├── hooks/
│   ├── useOnlineStatus.js           [NEW]
│   ├── useOfflineSOS.js             [NEW]
│   └── useGeolocation.js            [NEW]
├── components/
│   ├── OfflineAlert.jsx             [NEW]
│   ├── SosButton.jsx                [UPDATE]
│   ├── EmergencyContactManager.jsx  [NEW]
│   └── MapCard.jsx                  [NEW]
├── pages/
│   ├── ContactsPage.jsx             [NEW]
│   ├── PoliceDashboard.jsx          [NEW]
│   └── OfflineSOS.jsx               [NEW]
└── utils/
    ├── db.js                         [NEW - IndexedDB setup]
    ├── notifications.js              [NEW]
    └── geolocale.js                 [NEW]
```

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend

# Update application.properties with your API keys
# Then:
mvnw.cmd clean install -DskipTests
mvnw.cmd spring-boot:run
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Database Migrations
Migrations automatically applied via Liquibase/Flyway on startup.

### 4. Seed Demo Data
```bash
# After backend is running:
curl -X POST http://localhost:8080/api/admin/seed-demo-data \
  -H "Authorization: Bearer <admin-token>"
```

---

## 🔐 Security Notes
- All `/api/auth/**` endpoints are public
- All other endpoints require valid JWT token
- Admin endpoints require `role = 'ADMIN'`
- Police endpoints require `role = 'POLICE'`
- CORS enabled for `http://localhost:5173`

---

## 📊 Database Schema Changes

### New Tables
- `offline_sos_event` - offline SOS records
- `emergency_contact` - user emergency contacts
- `audit_log` - admin actions
- `geo_zone` - safety zones
- `incident_report` - user-reported incidents
- `user_location` - real-time location tracking
- `activity_log` - notification delivery logs

---

## 📬 API Endpoints (Phase 1)

### Offline SOS
- `POST /api/sos/offline-alert` - Queue offline SOS
- `POST /api/sos/offline-recovered` - Mark as recovered
- `GET /api/sos/offline/history` - Get offline SOS history

### Emergency Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/{id}` - Update contact
- `DELETE /api/contacts/{id}` - Delete contact

### Police Dashboard
- `GET /api/police/sos/recent` - Recent SOS events (role: POLICE)
- `GET /api/police/sos/{id}` - SOS details
- `POST /api/police/acknowledge/{id}` - Acknowledge event

### AI Services
- `POST /api/ai/classify-incident` - Classify severity
- `POST /api/ai/summarize` - Summarize incident
- `POST /api/ai/recommend-pois` - Recommend safe POIs

---

## 📝 API Keys Required

| Service | Where to Get | Environment Variable |
|---------|-------------|----------------------|
| Groq AI | https://console.groq.com | AI_API_KEY |
| Twilio SMS | https://www.twilio.com | TWILIO_* |
| Gmail SMTP | Google Account | EMAIL_SMTP_* |
| AWS S3 | AWS Console | S3_* |
| Firebase | Firebase Console | FIREBASE_CONFIG_JSON |

---

## ✅ Testing

### Backend Tests
```bash
cd backend
mvnw.cmd test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📖 Additional Notes

- Detailed API documentation in `Postman_Collection.json`
- Database schema in `migrations/` folder
- Docker compose available for PostgreSQL/Redis
- GitHub Actions CI/CD configured

