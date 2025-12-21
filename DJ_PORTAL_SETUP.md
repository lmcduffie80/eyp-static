# DJ Portal Setup Guide

## Overview

The DJ Portal provides DJs with access to:
- **Calendar Management**: Block out unavailable dates
- **Booking Review**: View current and past bookings
- **Email Reminders**: Automatic email reminders sent 2 weeks before each event

## Files Created

1. **`dj-login.html`** - Login page for DJ authentication
2. **`dj-dashboard.html`** - Main dashboard with calendar and bookings

## Current Status

The frontend is complete and functional for development/testing. However, for production use, you'll need to implement backend services.

## Required Backend Services

### 1. Authentication API

**Endpoint:** `POST /api/dj-login`

**Request:**
```json
{
  "username": "dj_username",
  "password": "password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": "dj_username"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Invalid username or password"
}
```

### 2. Bookings API

**Endpoint:** `GET /api/dj-bookings`

**Response:**
```json
[
  {
    "id": 1,
    "clientName": "John & Jane Smith",
    "eventType": "Wedding",
    "date": "2025-12-15",
    "time": "6:00 PM - 11:00 PM",
    "location": "PeachBarn at TimberMill Acres, Tifton, GA",
    "contactEmail": "john.smith@email.com",
    "contactPhone": "555-0123",
    "notes": "Outdoor ceremony, indoor reception"
  }
]
```

### 3. Block Dates API

**Endpoint:** `POST /api/dj/block-dates`

**Request:**
```json
{
  "date": "2025-12-20",
  "reason": "Personal time off"
}
```

**Endpoint:** `DELETE /api/dj/block-dates/:date`

### 4. Email Reminder Service

**Scheduled Job:** Run daily to check for bookings 14 days in the future

**Process:**
1. Query database for bookings exactly 14 days away
2. Check if reminder has already been sent
3. Send email to DJ with booking details
4. Mark reminder as sent in database

**Email Template:**
```
Subject: Reminder: Upcoming Event - [Client Name] - [Date]

Hi [DJ Name],

This is a reminder that you have an upcoming event:

Event: [Event Type]
Date: [Date]
Time: [Time]
Location: [Location]
Client: [Client Name]
Contact: [Email] / [Phone]

Notes: [Notes]

Please confirm your availability and prepare accordingly.

Best regards,
Externally Yours Productions, LLC
```

## Database Schema Suggestions

### Users Table
```sql
CREATE TABLE dj_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Blocked Dates Table
```sql
CREATE TABLE dj_blocked_dates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dj_user_id INT NOT NULL,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dj_user_id) REFERENCES dj_users(id),
  UNIQUE KEY unique_dj_date (dj_user_id, date)
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_name VARCHAR(255) NOT NULL,
  event_type VARCHAR(100),
  date DATE NOT NULL,
  time VARCHAR(100),
  location TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  dj_user_id INT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dj_user_id) REFERENCES dj_users(id)
);
```

## Security Considerations

1. **Password Hashing**: Use bcrypt or similar for password storage
2. **JWT Tokens**: Implement JWT for session management
3. **HTTPS**: Always use HTTPS in production
4. **Input Validation**: Validate all user inputs server-side
5. **SQL Injection**: Use parameterized queries
6. **Rate Limiting**: Implement rate limiting on login endpoint

## Email Service Options

### Option 1: SendGrid
- Free tier: 100 emails/day
- Easy API integration
- Good deliverability

### Option 2: AWS SES
- Very cost-effective
- Requires AWS account
- Good for high volume

### Option 3: Mailgun
- Developer-friendly
- Good API documentation
- Free tier available

### Option 4: Nodemailer (Node.js)
- Simple setup
- Works with Gmail, SMTP
- Good for small scale

## Implementation Steps

1. **Set up backend server** (Node.js, Python, PHP, etc.)
2. **Create database** with tables above
3. **Implement authentication** endpoint
4. **Implement bookings** API
5. **Implement block dates** API
6. **Set up email service** account
7. **Create scheduled job** for reminders (cron job or cloud function)
8. **Update frontend** to use real API endpoints
9. **Test thoroughly**
10. **Deploy to production**

## Development Mode

Currently, the dashboard works in development mode using localStorage. This allows you to:
- Test the UI/UX
- See how the calendar works
- Review the booking interface

To use in development:
1. Open `dj-login.html`
2. Enter any username/password
3. You'll be redirected to the dashboard
4. Data is stored in browser localStorage

**Note:** Remove the development fallback in `dj-login.html` before production deployment.

## Next Steps

1. Choose your backend technology stack
2. Set up database
3. Implement authentication
4. Connect frontend to backend APIs
5. Set up email reminder service
6. Test end-to-end functionality
7. Deploy to production

## Support

For questions or issues, refer to the main website documentation or contact the development team.

