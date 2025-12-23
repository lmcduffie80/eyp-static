# Gmail SMTP Setup Guide

This guide explains how to configure Gmail to send password reset emails for the DJ Portal.

## Important: Use App Passwords, Not Your Regular Gmail Password

For security reasons, Gmail requires App Passwords for third-party applications. You cannot use your regular Gmail password.

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", find **2-Step Verification**
4. Click on it and follow the prompts to enable 2-Step Verification
   - You'll need to verify your phone number
   - Google will send you a verification code

## Step 2: Generate an App Password

Once 2-Step Verification is enabled:

1. Go back to **Security** in your Google Account
2. Under "How you sign in to Google", find **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled
3. Click on **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter a name like "DJ Portal Password Reset"
7. Click **Generate**
8. Google will show you a 16-character password (it looks like: `abcd efgh ijkl mnop`)
9. **Copy this password immediately** - you won't be able to see it again!

## Step 3: Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add the following variables:

### Required Variables:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Note:** The app password is the 16-character password from Step 2 (remove spaces if there are any)

### Optional Variables:

```
EMAIL_FROM=your-email@gmail.com
BASE_URL=https://yourdomain.com
```

If `EMAIL_FROM` is not set, it will use `GMAIL_USER` as the sender.

## Step 4: Update API Code (Already Done)

The API code has been updated to use Gmail SMTP automatically when `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set.

## Step 5: Test the Setup

1. Deploy your changes to Vercel
2. Go to your site and click "Forgot Password?"
3. Enter an email address
4. Check your inbox (and spam folder) for the password reset email

## Troubleshooting

### "Invalid login" error

- Make sure you're using an **App Password**, not your regular Gmail password
- Verify that 2-Step Verification is enabled
- Check that the App Password was copied correctly (no extra spaces)

### Emails going to spam

- Gmail emails from personal accounts sometimes go to spam
- Consider setting up a "Send as" alias or using a custom domain
- For production use, consider using SendGrid or AWS SES instead

### "Less secure app access" message

- Google no longer supports "less secure app access"
- You **must** use App Passwords with 2-Step Verification enabled
- This is the only secure way to use Gmail SMTP

## Gmail Sending Limits

- **Daily sending limit:** 500 emails per day for regular Gmail accounts
- **Rate limit:** 100 emails per day when sending to external recipients (non-Gmail addresses)
- For higher volumes, consider using SendGrid or AWS SES

## Alternative: Use SendGrid or AWS SES

For production use, especially if you need to send many emails, consider:
- **SendGrid**: Free tier allows 100 emails/day
- **AWS SES**: Very affordable, pay per email
- **Google Workspace**: If you have a business Gmail account, limits are higher

## Security Best Practices

1. ✅ Never commit App Passwords to Git
2. ✅ Always use environment variables
3. ✅ Rotate App Passwords periodically
4. ✅ Use different App Passwords for different applications
5. ✅ Monitor your email sending activity

## Quick Reference

**Environment Variables Needed:**
```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
EMAIL_FROM=your-email@gmail.com (optional)
BASE_URL=https://yourdomain.com (optional)
```

**Where to get App Password:**
1. Google Account → Security → 2-Step Verification → App passwords
2. Generate password for "Mail" → "Other (Custom name)"
3. Copy the 16-character password

That's it! Your Gmail account is now configured to send password reset emails.

