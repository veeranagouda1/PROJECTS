# Google OAuth2 and SMS Setup Guide

## ✅ What Has Been Implemented

### Google OAuth2
- **Backend OAuth2 Configuration**: Added Spring Security OAuth2 client dependency
- **Security Config**: Configured OAuth2 endpoints and success handler
- **OAuth2 Success Handler**: Created `OAuth2SuccessHandler.java` that:
  - Handles successful Google authentication
  - Creates/logs in user automatically
  - Generates JWT token
  - Redirects to frontend with auth token and user data
- **Frontend OAuth Callback**: Created `OAuthCallback.jsx` to:
  - Process OAuth2 callback from backend
  - Store token and user data in localStorage
  - Redirect to appropriate dashboard based on role
- **Login Integration**: Updated Login page to redirect to OAuth2 authorization endpoint

### SMS Notifications
- **SMS Service**: Already implemented with Fast2SMS API
- **SOS Integration**: SosService sends SMS alerts to emergency contacts when SOS is triggered
- **SMS Content**: Includes user name, phone, and location link
- **API Key**: Configured in `application.properties` (fast2sms.api.key)

---

## 🔧 Configuration Steps Required

### Step 1: Set Up Google OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `http://localhost:8080/oauth2/authorization/google`
7. Copy **Client ID** and **Client Secret**

### Step 2: Set Environment Variables

**On Windows:**
```powershell
# Set temporary environment variables
$env:GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE"
$env:GOOGLE_CLIENT_SECRET = "YOUR_CLIENT_SECRET_HERE"

# Then run the backend
cd 'c:\Users\ACER\Travel-Planner 1\TravelPlanner\backend'
.\mvnw.cmd spring-boot:run
```

**Or add to application.properties permanently:**
```properties
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
```

### Step 3: SMS Configuration (Already Configured)

The Fast2SMS API key is already in `application.properties`:
```properties
fast2sms.api.key=W0ko1M0DLCRNcTbN7UEKU0ZPuY8AVx5JcjEjDZmokH9ti9kgtBWnQYu5xf6E
```

SMS will automatically send to emergency contacts when:
- User triggers SOS alert
- Message includes: User name, phone, location link

---

## 🧪 Testing Google OAuth

1. Start backend: `mvnw clean spring-boot:run`
2. Start frontend: `npm run dev`
3. Go to `http://localhost:5173/login`
4. Click **"Continue with Google"**
5. Sign in with your Google account
6. Should redirect to dashboard with token stored

---

## 📱 Testing SMS Notifications

1. Create a trip and add emergency contacts with phone numbers
2. Trigger SOS from the app
3. Emergency contacts will receive SMS with location link

**Note:** Phone numbers must be in international format (e.g., +91XXXXXXXXXX for India)

---

## 📋 Files Modified/Created

**Backend:**
- ✅ `pom.xml` - Added OAuth2 dependency
- ✅ `application.properties` - Added OAuth2 configuration
- ✅ `SecurityConfig.java` - Updated security rules
- ✅ `OAuth2SuccessHandler.java` - NEW, handles OAuth2 success
- ✅ `AuthController.java` - Updated with OAuth2 callback endpoint
- ✅ `AuthService.java` - Added loginOrRegisterWithOAuth2 method

**Frontend:**
- ✅ `Login.jsx` - Updated Google button with OAuth2 endpoint
- ✅ `OAuthCallback.jsx` - NEW, processes OAuth2 callback
- ✅ `App.jsx` - Added OAuth callback route

**SMS (Already Working):**
- ✅ `SmsService.java` - Sends SMS via Fast2SMS API
- ✅ `SosService.java` - Triggers SMS on SOS event

---

## ⚠️ Important Notes

1. **Google OAuth Redirect**: After successful authentication, user is redirected to `http://localhost:5173/oauth-callback`
2. **Token Storage**: JWT token is stored in localStorage for authenticated requests
3. **SMS Rate Limit**: Fast2SMS has rate limits - use accordingly
4. **Phone Format**: Emergency contact phone numbers must include country code
5. **Localhost Testing**: Use `http://localhost` for development; change for production

---

## ✨ How It Works (Flow Diagram)

```
Google Login Click
    ↓
Redirect to /oauth2/authorization/google
    ↓
Google Auth Server
    ↓
OAuth2SuccessHandler (Backend)
    ↓
Check/Create User
    ↓
Generate JWT Token
    ↓
Redirect to /oauth-callback with token
    ↓
OAuthCallback.jsx (Frontend)
    ↓
Store token in localStorage
    ↓
Redirect to /dashboard
```

---

## 🚨 SOS + SMS Flow

```
User Triggers SOS
    ↓
Create SosEvent
    ↓
Fetch Emergency Contacts
    ↓
Loop through contacts
    ↓
Send SMS via Fast2SMS API
    ↓
Send Email Notification
    ↓
Return to Frontend
```

---

## 🐛 Troubleshooting

### "403 Forbidden" Error
- Check OAuth2 client credentials are set correctly
- Verify redirect URIs match in Google Cloud Console
- Ensure environment variables are properly set

### SMS Not Sending
- Verify Fast2SMS API key is active
- Check phone numbers are in correct format (+COUNTRY_CODE NUMBER)
- Emergency contacts exist in database
- Check network connectivity to Fast2SMS servers

### OAuth Not Redirecting
- Clear browser cache and cookies
- Check browser console for errors
- Verify frontend OAuthCallback page is loading
- Check localStorage is accessible
