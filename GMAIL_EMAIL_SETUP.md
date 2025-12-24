# Gmail Email Setup Guide for DJ Reminders

This guide explains how to set up Gmail to send email reminders to DJs about their upcoming bookings.

## Overview

The email reminder feature uses Gmail SMTP to send emails directly from your Gmail account to DJs about their upcoming bookings.

## Setup Steps

### Step 1: Enable 2-Factor Authentication on Your Gmail Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with your Gmail account
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the prompts to enable 2-factor authentication

### Step 2: Generate an App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "Signing in to Google", click **2-Step Verification** (if not already enabled, enable it first)
3. Scroll down and click **App passwords**
4. You may be prompted to sign in again
5. Under "Select app", choose **Mail**
6. Under "Select device", choose **Other (Custom name)**
7. Enter a name like "Vercel Email Reminders" and click **Generate**
8. **Copy the 16-character password** (you won't see it again!)
   - Format: `xxxx xxxx xxxx xxxx` (spaces are optional)

### Step 3: Set Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   **Variable 1: GMAIL_USER**
   - **Key**: `GMAIL_USER`
   - **Value**: Your Gmail address (e.g., `yourname@gmail.com`)
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

   **Variable 2: GMAIL_APP_PASSWORD**
   - **Key**: `GMAIL_APP_PASSWORD`
   - **Value**: The 16-character app password you generated (e.g., `abcd efgh ijkl mnop` - spaces are optional)
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

   **Variable 3: FROM_EMAIL (Optional)**
   - **Key**: `FROM_EMAIL`
   - **Value**: The email address to display as sender (defaults to GMAIL_USER if not set)
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

### Step 4: Redeploy Your Application

**IMPORTANT**: After adding environment variables, you must redeploy!

1. Go to **Deployments** tab in Vercel
2. Click the **three dots (⋯)** on your latest deployment
3. Select **Redeploy**
4. Wait for deployment to complete (1-2 minutes)

### Step 5: Test the Email Reminder

1. Go to your admin dashboard
2. Navigate to the **Home** tab
3. Find a DJ with upcoming bookings
4. Click the **✉️ Send Email Reminder** button
5. Confirm the action
6. Check the DJ's email inbox for the reminder

## Email Format

The email reminder includes:
- Professional HTML email with your branding
- List of upcoming bookings (up to 10 shown)
- Event details (date, location, event type)
- Plain text version for email clients that don't support HTML

## Troubleshooting

### "Email service not configured" Error

**Problem**: API returns this error when trying to send emails.

**Solutions**:
1. ✅ Verify both `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set in Vercel
2. ✅ Check that you selected all environments (Production, Preview, Development)
3. ✅ **Redeploy your application** after adding variables
4. ✅ Verify variable names are exactly:
   - `GMAIL_USER` (not `GMAIL_EMAIL` or similar)
   - `GMAIL_APP_PASSWORD` (not `GMAIL_PASSWORD` or similar)

### "Failed to send email: Invalid login" Error

**Problem**: Authentication fails with Gmail.

**Solutions**:
1. ✅ Verify your Gmail address is correct (full email including @gmail.com)
2. ✅ Verify the app password is correct (16 characters, no extra spaces)
3. ✅ Make sure you're using an **App Password**, not your regular Gmail password
4. ✅ Ensure 2-factor authentication is enabled on your Gmail account
5. ✅ Try generating a new app password

### Email Not Received

**Problem**: Email doesn't arrive at the DJ's inbox.

**Solutions**:
1. ✅ Check spam/junk folder
2. ✅ Verify the DJ's email address is correct in their user profile
3. ✅ Check Vercel function logs for errors
4. ✅ Verify Gmail account hasn't been locked or restricted
5. ✅ Test sending to your own email first

### "Cannot reach the API endpoint" Error

**Problem**: Frontend can't reach the email API.

**Solutions**:
1. ✅ Verify the function is deployed: Visit `https://your-project.vercel.app/api/send-dj-email-reminder`
2. ✅ Should return: `{"success":true,"message":"Send DJ Email Reminder API is running",...}`
3. ✅ Check browser console for network errors
4. ✅ Verify you're on the correct domain

## Security Notes

- ⚠️ **Never commit Gmail credentials to Git**
- ⚠️ **Always use environment variables** for sensitive data
- ⚠️ **App passwords are safer** than using your main Gmail password
- ⚠️ **Don't share your app password** - generate a new one if compromised

## Gmail Daily Limits

Gmail has sending limits:
- **Free Gmail accounts**: 500 emails per day
- **Google Workspace accounts**: 2,000 emails per day

If you exceed these limits, you'll need to wait 24 hours or upgrade to Google Workspace.

## Quick Checklist

Before sending reminders, verify:
- [ ] 2-factor authentication enabled on Gmail
- [ ] App password generated and copied
- [ ] `GMAIL_USER` environment variable set in Vercel
- [ ] `GMAIL_APP_PASSWORD` environment variable set in Vercel
- [ ] Variables set for Production, Preview, and Development
- [ ] Application redeployed after adding variables
- [ ] GET request to `/api/send-dj-email-reminder` returns success
- [ ] DJs have valid email addresses in their profiles

## Need Help?

If you encounter issues:
1. Check Vercel function logs for detailed error messages
2. Test the endpoint directly: `https://your-project.vercel.app/api/send-dj-email-reminder`
3. Verify all environment variables are correctly set
4. Try generating a new app password

Happy emailing! ✉️

