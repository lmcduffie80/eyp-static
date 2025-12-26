# Google Calendar API Key - Quick Setup Guide

This is a simplified guide to set up Google Calendar integration using an API key.

## Prerequisites

- A Google account with a calendar
- Access to your Vercel project dashboard

## Step 1: Enable Google Calendar API & Create API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Wait for project creation to complete

3. **Enable Google Calendar API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click on it and press "Enable"
   - Wait for it to enable

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "+ CREATE CREDENTIALS" at the top
   - Select "API key"
   - Your API key will be displayed - **COPY THIS** (you'll need it later)
   - Click "Restrict key" (recommended)
     - Under "API restrictions", select "Restrict key"
     - Choose "Google Calendar API" from the dropdown
     - Click "Save"

## Step 2: Get Your Calendar ID

1. **Go to Google Calendar**
   - Visit: https://calendar.google.com/
   - Sign in if needed

2. **Make Calendar Accessible**
   - Click the three dots (⋮) next to your calendar name in the left sidebar
   - Select "Settings and sharing"
   - Scroll down to "Access permissions"
   - Check "Make available to public" OR
   - Under "Share with specific people", add your calendar email and set permission level

3. **Get Calendar ID**
   - Still in "Settings and sharing"
   - Scroll down to "Integrate calendar"
   - Copy the "Calendar ID" (usually looks like an email address, e.g., `yourname@gmail.com`)
   - **OR** you can just use your Google account email address

## Step 3: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in and select your project

2. **Navigate to Settings**
   - Click on your project
   - Go to "Settings" tab
   - Click "Environment Variables" in the left sidebar

3. **Add First Variable: API Key**
   - Click "Add New"
   - **Key:** `GOOGLE_CALENDAR_API_KEY`
   - **Value:** (paste the API key you copied in Step 1)
   - Select environments: Production, Preview, Development (or just Production)
   - Click "Save"

4. **Add Second Variable: Calendar ID**
   - Click "Add New" again
   - **Key:** `GOOGLE_CALENDAR_ID`
   - **Value:** (paste your calendar ID or email from Step 2)
   - Select environments: Production, Preview, Development (or just Production)
   - Click "Save"

## Step 4: Redeploy Your Application

1. **Redeploy in Vercel**
   - Go to the "Deployments" tab
   - Click the three dots (⋮) on the latest deployment
   - Select "Redeploy"
   - OR push a new commit to trigger automatic deployment

2. **Wait for Deployment**
   - Wait for the deployment to complete (usually 1-2 minutes)

## Step 5: Test It

1. **Visit Your Website**
   - Go to your live website (e.g., `eyp-static.vercel.app`)
   - Scroll down to the "Available Dates" section

2. **What You Should See**
   - A calendar displaying the current month
   - Navigation buttons (Previous/Next)
   - Saturdays marked as:
     - **Green** = Available (no events)
     - **Red** = Blocked (has events scheduled)

3. **If It's Not Working**
   - Check the browser console (F12) for errors
   - Verify environment variables are set correctly in Vercel
   - Make sure the calendar is publicly accessible
   - Verify events exist on Saturdays in your Google Calendar

## Troubleshooting

**"Calendar not loading" or "Unable to load available dates"**
- Verify `GOOGLE_CALENDAR_API_KEY` is set in Vercel
- Verify `GOOGLE_CALENDAR_ID` is set in Vercel
- Make sure you redeployed after adding the variables
- Check that the API key is not expired or deleted

**"Failed to fetch calendar events"**
- Verify Google Calendar API is enabled in Google Cloud Console
- Check that the API key is restricted to Google Calendar API only
- Verify the calendar ID is correct (try using your email address)

**"No blocked dates showing"**
- Make sure you have events scheduled on Saturdays in your Google Calendar
- Verify the calendar is publicly accessible
- Check that events are not cancelled or deleted

**Calendar shows but all Saturdays are green (available)**
- This means no events are found on Saturdays
- Add a test event on a Saturday to verify it works
- Check that events have start dates set correctly

## Quick Checklist

- [ ] Google Calendar API enabled in Google Cloud Console
- [ ] API key created and copied
- [ ] API key restricted to Google Calendar API
- [ ] Calendar ID or email copied
- [ ] Calendar is publicly accessible or shared appropriately
- [ ] `GOOGLE_CALENDAR_API_KEY` added to Vercel environment variables
- [ ] `GOOGLE_CALENDAR_ID` added to Vercel environment variables
- [ ] Application redeployed after adding variables
- [ ] Tested on live website

## Security Best Practices

- ✅ Never commit API keys to your repository
- ✅ Restrict API key to only Google Calendar API
- ✅ Use environment variables (not hardcoded values)
- ✅ Only make calendar public if necessary (consider sharing with specific people if possible)
- ✅ Regularly rotate API keys if compromised

That's it! Your calendar should now be integrated and showing available dates on your website.

