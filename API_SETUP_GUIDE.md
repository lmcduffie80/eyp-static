# Password Reset API Setup Guide

This guide explains how to set up the password reset email functionality for the DJ Portal.

## Overview

The password reset flow consists of three API endpoints:
1. `/api/dj-reset-password` - Request password reset (sends email)
2. `/api/dj-validate-reset-token` - Validate reset token (optional)
3. `/api/dj-reset-password-confirm` - Confirm password reset (updates password)

## Prerequisites

1. A Vercel account (or another hosting platform that supports serverless functions)
2. An email service account (SendGrid recommended, or AWS SES)
3. A database (Vercel Postgres, MongoDB Atlas, or your preferred database)

## Step 1: Install Dependencies

Install the required npm packages:

```bash
npm install @sendgrid/mail
```

For password hashing (recommended):
```bash
npm install bcrypt
```

For database (choose one):
- Vercel Postgres: Already included with Vercel
- MongoDB: `npm install mongodb`
- Or use your preferred database client

## Step 2: Set Up Email Service (SendGrid - Recommended)

### Option A: SendGrid

1. Sign up for a free SendGrid account at https://sendgrid.com
2. Go to Settings > API Keys
3. Create a new API key with "Full Access" or "Mail Send" permissions
4. Copy the API key

### Option B: AWS SES

1. Set up AWS SES in your AWS account
2. Verify your sender email address or domain
3. Get your AWS credentials (Access Key ID and Secret Access Key)
4. Note your AWS region (e.g., `us-east-1`)

## Step 3: Set Up Database

### Option A: Vercel Postgres

1. In your Vercel project dashboard, go to Storage
2. Create a new Postgres database
3. Run the following SQL to create tables:

```sql
-- Users table (if not already exists)
CREATE TABLE IF NOT EXISTS dj_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Password resets table
CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
```

### Option B: MongoDB Atlas

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. The collections will be created automatically when used

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to Settings > Environment Variables and add:

### Required Variables:

```
SENDGRID_API_KEY=your_sendgrid_api_key_here
EMAIL_FROM=noreply@yourdomain.com
BASE_URL=https://yourdomain.com
```

### For Database (choose based on your setup):

**If using Vercel Postgres:**
```
POSTGRES_URL=your_postgres_connection_string
```

**If using MongoDB:**
```
DATABASE_URL=your_mongodb_connection_string
```

**If using AWS SES instead of SendGrid:**
```
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
EMAIL_FROM=noreply@yourdomain.com
```

## Step 5: Update API Code for Your Database

Open each API file and uncomment/update the database code sections:

### For Vercel Postgres:

1. Open `api/dj-reset-password.js`
2. Uncomment the Vercel Postgres code in `checkUserExists()` and `storeResetToken()`
3. Update `api/dj-validate-reset-token.js` similarly
4. Update `api/dj-reset-password-confirm.js` similarly

Add at the top of each file:
```javascript
const { sql } = require('@vercel/postgres');
```

### For MongoDB:

1. Open each API file
2. Uncomment the MongoDB code sections
3. Update connection strings

Add at the top of each file:
```javascript
const { MongoClient } = require('mongodb');
```

## Step 6: Add Password Hashing (Security)

In `api/dj-reset-password-confirm.js`, update the `hashPassword()` function to use bcrypt:

```javascript
const bcrypt = require('bcrypt');

function hashPassword(password) {
    return bcrypt.hashSync(password, 10);
}
```

Also update your login endpoint to compare hashed passwords:
```javascript
const bcrypt = require('bcrypt');
const isValid = bcrypt.compareSync(password, user.hashedPassword);
```

## Step 7: Deploy to Vercel

1. Commit your changes:
```bash
git add .
git commit -m "Add password reset API endpoints"
git push
```

2. Vercel will automatically deploy your changes
3. Test the endpoints:
   - Visit your site
   - Click "Forgot Password?"
   - Enter an email address
   - Check your email for the reset link

## Step 8: Verify Email Sender (Important!)

### SendGrid:
- Go to SendGrid dashboard > Settings > Sender Authentication
- Verify your sender email address
- Without verification, emails may be marked as spam

### AWS SES:
- Verify your sender email/domain in SES console
- Move out of sandbox mode for production (request production access)

## Testing

### Test the reset password flow:

1. Go to `/dj-request-reset.html`
2. Enter a valid email address
3. Check your email inbox (and spam folder)
4. Click the reset link
5. Enter a new password
6. Try logging in with the new password

### Test API endpoints directly:

```bash
# Request reset
curl -X POST https://yourdomain.com/api/dj-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Validate token
curl -X POST https://yourdomain.com/api/dj-validate-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token_here"}'

# Confirm reset
curl -X POST https://yourdomain.com/api/dj-reset-password-confirm \
  -H "Content-Type: application/json" \
  -d '{"token":"your_token_here","newPassword":"newpassword123"}'
```

## Security Best Practices

1. ✅ Always hash passwords (use bcrypt)
2. ✅ Use HTTPS only
3. ✅ Set token expiration (1 hour)
4. ✅ Mark tokens as used after password reset
5. ✅ Don't reveal if email exists (always return success)
6. ✅ Validate token on both frontend and backend
7. ✅ Use strong, randomly generated tokens (32+ bytes)
8. ✅ Rate limit password reset requests
9. ✅ Log security events for monitoring

## Troubleshooting

### Emails not sending:
- Check SendGrid API key is correct
- Verify sender email address in SendGrid
- Check email is not in spam folder
- Verify BASE_URL is correct

### Tokens not working:
- Check database connection
- Verify token expiration logic
- Ensure tokens are being stored correctly

### Password not updating:
- Check database update query
- Verify user exists with that email
- Check password hashing is working

## Support

For issues:
1. Check Vercel function logs in dashboard
2. Check email service logs (SendGrid/AWS SES)
3. Verify environment variables are set correctly
4. Test database queries separately

