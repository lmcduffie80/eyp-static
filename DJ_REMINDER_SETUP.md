# DJ Reminder System Setup Guide

## Overview
Send automated reminders to DJs two weeks before their scheduled events.

## Recommended Approach: Email (Gmail API)

Since you already have Gmail API configured for password resets, this is the easiest and most cost-effective solution.

### Advantages
- ✅ Already set up (using existing Gmail API credentials)
- ✅ Free to use
- ✅ Can include detailed booking information
- ✅ Professional and trackable
- ✅ Works for all DJs (only need email addresses)

### Implementation Steps

1. **Create a Scheduled Reminder API Endpoint**
   - Create `/api/send-dj-reminders.js`
   - Run daily (check bookings 14 days out)
   - Query bookings table for upcoming events
   - Send reminder emails to assigned DJs

2. **Required Data from Bookings**
   - `dj_user` - DJ name/identifier
   - `date` - Event date
   - `time` - Event time
   - `location` - Event location
   - `client_name` - Client name
   - `event_type` - Type of event
   - `notes` - Additional notes
   - DJ email address (from users table)

3. **Email Template Should Include**
   - Event date and time
   - Location/venue
   - Client contact information
   - Event type
   - Important notes
   - Link to DJ dashboard to view full details

## Alternative: SMS via Twilio (Optional Enhancement)

For higher visibility, you can add SMS reminders as a supplement to email.

### Advantages
- ✅ Very high open/read rate
- ✅ Instant delivery
- ✅ Good for urgent/time-sensitive info

### Disadvantages
- ❌ Cost: ~$0.0075 per SMS (~$0.75 per 100 reminders)
- ❌ Requires phone numbers for all DJs
- ❌ Character limit (160 chars for simple SMS)
- ❌ Less detail can be included

### Twilio Setup (if desired)
1. Sign up at twilio.com
2. Get API credentials (Account SID, Auth Token)
3. Purchase phone number ($1/month + usage)
4. Add to environment variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

## Recommended Implementation Plan

### Phase 1: Email Reminders (Start Here)
1. Create API endpoint for sending reminders
2. Use existing Gmail API setup
3. Test with sample booking
4. Set up scheduled job (Vercel Cron or similar)

### Phase 2: Add SMS (Optional)
1. If email reminders aren't sufficient
2. Add Twilio integration
3. Send SMS in addition to email (not replacement)

## Scheduling Options

### Option 1: Vercel Cron Jobs (Recommended)
- Built into Vercel
- Free tier: 2 cron jobs
- Runs on schedule (daily recommended)
- Easy to set up

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/send-dj-reminders",
    "schedule": "0 9 * * *"
  }]
}
```
This runs daily at 9 AM UTC.

### Option 2: External Cron Service
- cron-job.org (free)
- EasyCron (free tier)
- Set to call your API endpoint daily

### Option 3: Manual Trigger
- Create admin dashboard button
- Run reminders on-demand
- Good for testing

## Sample Email Template

```
Subject: Reminder: Upcoming Event in 2 Weeks - [Client Name]

Hi [DJ Name],

This is a friendly reminder that you have an upcoming event:

📅 Event Date: [Date]
⏰ Event Time: [Time]
📍 Location: [Location]
👤 Client: [Client Name]
🎉 Event Type: [Event Type]

Important Notes:
[Notes]

You can view full booking details in your DJ dashboard:
[Link to dashboard]

Please confirm your availability and reach out to the client if needed.

Best regards,
Externally Yours Productions
```

## Next Steps

1. Decide: Email only or Email + SMS?
2. Create `/api/send-dj-reminders.js` endpoint
3. Set up scheduled job (Vercel Cron recommended)
4. Test with sample booking
5. Monitor and adjust as needed

Would you like me to create the reminder API endpoint using your existing Gmail API setup?

