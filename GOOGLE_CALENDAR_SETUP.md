# Google Calendar Integration Setup

This guide explains how to set up Google Calendar integration to show available dates on the website.

## Overview

The website fetches events from your Google Calendar and marks Saturdays as "blocked" if they have one or more events scheduled. This helps visitors see your availability for Saturday bookings.

## Setup Steps

### 1. Create Google Calendar API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create an API Key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key (you'll need this)

5. (Optional but Recommended) Restrict the API Key:
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Calendar API"
   - Save

### 2. Get Your Calendar ID

You can use one of these formats:

**Option 1: Email address** (if your calendar is shared publicly or via API)
- Use your Google account email: `your-email@gmail.com`

**Option 2: Calendar ID from Calendar Settings**
1. Go to [Google Calendar](https://calendar.google.com/)
2. Click the three dots next to your calendar name
3. Select "Settings and sharing"
4. Scroll down to "Integrate calendar"
5. Copy the "Calendar ID" (usually looks like an email address)

### 3. Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following environment variables:

   - **Name:** `GOOGLE_CALENDAR_API_KEY`
     **Value:** Your API key from step 1

   - **Name:** `GOOGLE_CALENDAR_ID`
     **Value:** Your calendar ID or email from step 2

   (Alternative: You can also use `GOOGLE_CALENDAR_EMAIL` instead of `GOOGLE_CALENDAR_ID`)

4. Make sure to set these for the correct environments (Production, Preview, Development)
5. Redeploy your application after adding the environment variables

## How It Works

- The API endpoint `/api/google-calendar` fetches events from your Google Calendar for the next 12 months
- It filters events to only include Saturdays (day 6 in JavaScript)
- If a Saturday has one or more events, it's marked as "blocked"
- The calendar displays on the website showing:
  - **Green** = Available Saturday (no events)
  - **Red** = Blocked Saturday (has events scheduled)
  - **Orange** = Today's date

## Testing

After setup, visit your website and scroll to the "Available Dates" section. You should see:
- A calendar displaying the current month
- Navigation buttons to view future months
- Saturdays marked as available (green) or blocked (red) based on your Google Calendar events

## Troubleshooting

**Calendar not loading:**
- Check that environment variables are set correctly in Vercel
- Verify the API key has Google Calendar API enabled
- Check browser console for error messages

**No events showing as blocked:**
- Verify your calendar ID is correct
- Make sure you have events scheduled on Saturdays in your Google Calendar
- Check that the calendar is accessible (not private)

**API errors:**
- Verify your API key is valid and not expired
- Check that Google Calendar API is enabled for your project
- Ensure the API key has permission to access the calendar

## Security Notes

- Never commit API keys to your repository
- Keep your API key restricted to only Google Calendar API
- Consider making your calendar publicly readable if you want the website to access it, or use OAuth for private calendars (more complex setup)

