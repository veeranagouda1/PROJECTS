# Travel Planner - Full Stack Application

A comprehensive travel planning application with trip management, budget tracking, SOS emergency features, AI chatbot, and more.

## Tech Stack

### Backend
- Spring Boot 3.5.7
- Java 21
- PostgreSQL
- JWT Authentication
- Maven

### Frontend
- React 19
- Vite
- Axios
- React Router
- Recharts (for charts)
- Leaflet (for maps)
- React Leaflet

## Features

1. **Trip Planner** - Create, edit, and manage travel trips
2. **Budget Planner** - Track expenses by category and trip with visual charts
3. **SOS & Emergency** - Send emergency SOS requests with location tracking
4. **AI Chatbot** - Get travel advice from AI assistant
5. **User Profile** - Manage user profile and settings
6. **Notifications** - Real-time notification system
7. **Admin Dashboard** - Admin panel for user and SOS management
8. **Map & POI** - Add points of interest to trips with map visualization

## Setup Instructions

### Prerequisites
- Java 21
- Maven
- Node.js and npm
- PostgreSQL database

### Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE travel_db;
CREATE USER travel_user WITH PASSWORD 'secret';
GRANT ALL PRIVILEGES ON DATABASE travel_db TO travel_user;
```

2. Update `backend/src/main/resources/application.properties` if needed:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/travel_db
spring.datasource.username=travel_user
spring.datasource.password=secret
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build and run:
```bash
.\mvnw.cmd clean install -DskipTests
.\mvnw.cmd spring-boot:run
```

The backend will run on `http://localhost:8080`

**Important**: Before testing the AI chatbot feature, add your OpenAI API key to `backend/src/main/resources/application.properties`:
```properties
ai.api.key=your-openai-api-key-here
ai.model=gpt-3.5-turbo
```

Or set it as an environment variable:
```bash
export AI_API_KEY=your-openai-api-key-here
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Trips
- `POST /api/trip` - Create trip
- `GET /api/trip/user` - Get user's trips
- `PUT /api/trip/{id}` - Update trip
- `DELETE /api/trip/{id}` - Delete trip

### Budget
- `POST /api/budget/add` - Add expense
- `GET /api/budget/user` - Get user's expenses
- `GET /api/budget/trip/{tripId}` - Get expenses by trip
- `PUT /api/budget/{id}` - Update expense
- `DELETE /api/budget/{id}` - Delete expense

### SOS
- `POST /api/sos/send` - Send SOS request
- `GET /api/sos/user` - Get user's SOS events

### AI Chat
- `POST /api/ai/chat` - Chat with AI assistant

### User
- `GET /api/user/me` - Get current user profile
- `PUT /api/user/me` - Update user profile

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/mark-read/{id}` - Mark notification as read

### Admin (requires ADMIN role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/sos/recent` - Get recent SOS events
- `DELETE /api/admin/user/{id}` - Delete user

### POI (Points of Interest)
- `POST /api/poi` - Create POI
- `GET /api/poi/trip/{tripId}` - Get POIs by trip
- `DELETE /api/poi/{id}` - Delete POI

## Postman Collection

A Postman collection is available at the root: `Travel-Planner-Postman-Collection.json`

Import this into Postman to test all API endpoints. Don't forget to set the `token` variable after logging in.

## Security

- All endpoints except `/api/auth/**` require JWT authentication
- JWT token should be sent in the `Authorization` header as `Bearer <token>`
- Admin endpoints require user role to be `ADMIN`

## Notes

- The application uses JPA with `spring.jpa.hibernate.ddl-auto=update`, so tables will be created automatically
- CORS is enabled for `http://localhost:5173`
- AI chatbot requires OpenAI API key to be configured
- Image upload in profile uses base64 encoding (for production, use a proper image upload service)

## Troubleshooting

1. **Backend won't start**: Check PostgreSQL is running and database credentials are correct
2. **Frontend can't connect**: Ensure backend is running on port 8080
3. **401 Unauthorized**: Make sure you're logged in and token is valid
4. **AI Chatbot errors**: Verify `ai.api.key` is set in application.properties

## License

This project is for educational purposes.

