# Gmail Email Setup Guide for Password Reset

This guide walks you through setting up email functionality for the DJ password reset feature.

## Option 1: Gmail SMTP (Easiest - Recommended) ✅

This is the simplest method and works with personal Gmail accounts.

### Steps:

1. **Enable 2-Factor Authentication on your Gmail account**
   - Go to your Google Account settings: https://myaccount.google.com/
   - Navigate to Security → 2-Step Verification
   - Enable it if not already enabled

2. **Create an App Password**
   - While still in Security settings, find "App passwords" (or go directly: https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app type
   - Select "Other (Custom name)" as the device
   - Enter a name like "EYP Password Reset"
   - Click "Generate"
   - **Copy the 16-character password** (you'll only see it once!)

3. **Set Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add these variables:
     ```
     GMAIL_USER=your-email@gmail.com
     GMAIL_APP_PASSWORD=your-16-character-app-password
     EMAIL_FROM=your-email@gmail.com (or a friendly name like "EYP Portal <your-email@gmail.com>")
     ```

4. **Deploy/Redeploy**
   - The code will automatically use Gmail SMTP when these variables are set
   - No additional configuration needed!

---

## Option 2: Gmail API (More Complex)

This method uses the Gmail API directly. It's more powerful but requires more setup.

### Requirements:
- Google Cloud Project (can use the same one as your Calendar API)
- Service Account OR OAuth2 credentials

### Steps for Service Account (Workspace Only):

**If you have Google Workspace:**

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - Select your existing project (or create a new one)

2. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "Service Account"
   - Give it a name (e.g., "gmail-sender")
   - Click "Create and Continue"
   - Skip role assignment (click "Continue")
   - Click "Done"

4. **Create and Download Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the JSON file

5. **Enable Domain-Wide Delegation** (Required for sending emails)
   - In the service account details, check "Enable Google Workspace Domain-wide Delegation"
   - Note the service account email (e.g., `gmail-sender@your-project.iam.gserviceaccount.com`)

6. **Authorize in Google Workspace Admin**
   - Go to Google Admin Console: https://admin.google.com/
   - Navigate to Security → API Controls → Domain-wide Delegation
   - Click "Add new"
   - Enter the Client ID from your service account JSON file
   - Enter this scope: `https://www.googleapis.com/auth/gmail.send`
   - Click "Authorize"

7. **Extract Credentials from JSON**
   - Open the downloaded JSON file
   - Find `client_email` and `private_key` values
   - Copy them (the private_key is long and includes `\n` characters)

8. **Set Environment Variables in Vercel**
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   EMAIL_FROM=your-workspace-email@yourdomain.com
   ```

### Steps for OAuth2 (Personal Gmail):

**If you only have a personal Gmail account (not Workspace):**

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com/
   - Select your project

2. **Enable Gmail API**
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Fill in required information
   - Add scope: `https://www.googleapis.com/auth/gmail.send`
   - Add your email as a test user

4. **Create OAuth2 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `https://eyp-static.vercel.app/api/oauth/callback` (or your domain)
   - Download the credentials JSON

5. **Generate Refresh Token** (Requires one-time setup)
   - You'll need to run a script once to generate a refresh token
   - This is complex for serverless environments
   - **Recommendation: Use Option 1 (SMTP) instead for personal Gmail**

---

## Testing

After setting up either option:

1. **Go to your deployed site**: https://eyp-static.vercel.app/dj-request-reset.html
2. **Enter a DJ email address** from your database
3. **Click "Send Reset Link"**
4. **Check the email inbox** (and spam folder)
5. **Check Vercel logs** for any errors: Vercel Dashboard → Your Project → Logs

---

## Troubleshooting

### "No email service configured"
- Make sure environment variables are set in Vercel
- Redeploy after adding environment variables

### Emails not received
- Check spam folder
- Verify email address exists in your users table
- Check Vercel function logs for errors

### Gmail API Authentication Errors
- Verify service account credentials are correct
- Check that domain-wide delegation is enabled (Workspace only)
- Ensure Gmail API is enabled in Google Cloud Console

### For Gmail SMTP (Option 1):
- Make sure 2FA is enabled
- Verify app password is correct (16 characters, no spaces)
- Try generating a new app password

---

## Recommendation

**For most users, Option 1 (Gmail SMTP) is the best choice** because:
- ✅ Works with personal Gmail accounts
- ✅ Simple setup (just need app password)
- ✅ No Google Cloud Console complexity
- ✅ Works immediately after setup
- ✅ Secure (uses app-specific password)

**Use Option 2 (Gmail API) if:**
- You have Google Workspace
- You need advanced Gmail features
- You want API-level control
