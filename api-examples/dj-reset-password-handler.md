# DJ Portal Password Reset Implementation Guide

This guide explains how to implement the backend API endpoint for password reset functionality.

## Overview

When a user requests a password reset, the system should:
1. Validate the email address
2. Check if a user with that email exists
3. Generate a secure reset token
4. Store the token with an expiration time
5. Send an email with a reset link
6. Return a success response (without revealing if the email exists)

## API Endpoint

**POST** `/api/dj-reset-password`

### Request Body
```json
{
  "email": "user@example.com"
}
```

### Response
```json
{
  "success": true,
  "message": "If an account exists with that email, a password reset link has been sent."
}
```

## Implementation Options

### Option 1: AWS Lambda + SES (Serverless)

If deploying to AWS:

1. Create a Lambda function
2. Set up AWS SES for sending emails
3. Store reset tokens in DynamoDB
4. Use API Gateway to expose the endpoint

**Example Lambda handler:**
```javascript
const AWS = require('aws-sdk');
const crypto = require('crypto');
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
    const { email } = JSON.parse(event.body);
    
    // Generate token and store in DynamoDB
    const token = crypto.randomBytes(32).toString('hex');
    // ... store token logic
    
    // Send email via SES
    const resetLink = `https://yourdomain.com/dj-reset-password?token=${token}`;
    // ... send email logic
    
    return {
        statusCode: 200,
        body: JSON.stringify({ success: true, message: '...' })
    };
};
```

### Option 2: Node.js/Express with SendGrid

1. Install SendGrid: `npm install @sendgrid/mail`
2. Set up SendGrid account and get API key
3. Store tokens in your database
4. Use the example code provided in `dj-reset-password-example.js`

### Option 3: Vercel Serverless Functions

If using Vercel:

1. Create `api/dj-reset-password.js` in your project
2. Use SendGrid, AWS SES, or another email service
3. Store tokens in a database (Vercel Postgres, MongoDB Atlas, etc.)

## Email Service Setup

### SendGrid (Recommended)
1. Sign up at https://sendgrid.com
2. Get API key from Settings > API Keys
3. Verify sender email address
4. Use SendGrid Node.js library

### AWS SES
1. Set up AWS SES in your region
2. Verify sender email/domain
3. Move out of sandbox mode for production
4. Use AWS SDK to send emails

### SMTP (Gmail, etc.)
1. Use Nodemailer with SMTP
2. For Gmail, create app-specific password
3. Less reliable for production

## Database Schema

Store reset tokens in your database:

```javascript
{
  email: "user@example.com",
  token: "abc123...",
  expiresAt: ISODate("2024-12-27T13:00:00Z"),
  createdAt: ISODate("2024-12-27T12:00:00Z"),
  used: false
}
```

## Security Considerations

1. **Token Generation**: Use cryptographically secure random tokens (32+ bytes)
2. **Token Expiration**: Set tokens to expire after 1 hour
3. **One-Time Use**: Mark tokens as used after password reset
4. **Rate Limiting**: Limit password reset requests per email/IP
5. **No Email Revelation**: Always return success, don't reveal if email exists
6. **HTTPS Only**: Always use HTTPS for reset links

## Reset Password Page

You'll also need to create a page at `/dj-reset-password.html` that:
1. Accepts a token from the URL query parameter
2. Validates the token
3. Allows user to enter new password
4. Updates password in database
5. Invalidates the token

## Environment Variables

Set these in your backend environment:
```
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password-or-api-key
EMAIL_FROM=noreply@yourdomain.com
BASE_URL=https://yourdomain.com
DATABASE_URL=your-database-connection-string
```

## Testing

Test the endpoint with:
```bash
curl -X POST https://yourdomain.com/api/dj-reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Next Steps

1. Choose your backend platform (AWS, Vercel, Express, etc.)
2. Set up email service (SendGrid recommended)
3. Create database table/collection for reset tokens
4. Implement the API endpoint using the example code
5. Create the reset password page (`dj-reset-password.html`)
6. Test the full flow

