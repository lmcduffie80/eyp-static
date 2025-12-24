# SMS Reminder Setup Guide for DJ Bookings

This guide explains how to set up SMS reminders to send DJs notifications about their upcoming bookings.

## Overview

The SMS reminder feature allows admins to send text messages to DJs about their upcoming bookings directly from the admin dashboard. This uses Twilio as the SMS service provider.

## Setup Steps

### 1. Create a Twilio Account

1. Go to [twilio.com](https://www.twilio.com) and sign up for a free account
2. You'll receive a free trial credit to test SMS functionality
3. Verify your phone number during signup

### 2. Get Your Twilio Credentials

1. Log in to your Twilio Console
2. Go to **Account** → **API Keys & Tokens**
3. Note your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### 3. Get a Twilio Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a Number**
2. Select a phone number (choose one with SMS capabilities)
3. Purchase the number (free trial accounts get one free number)
4. Copy the phone number (format: +1234567890)

### 4. Configure Environment Variables in Vercel

1. Go to your Vercel Dashboard
2. Navigate to your project → **Settings** → **Environment Variables**
3. Add the following variables:

   ```
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN = your_auth_token_here
   TWILIO_PHONE_NUMBER = +1234567890
   ```

4. Click **Save** for each variable
5. **Important**: Redeploy your application for the environment variables to take effect

### 5. Add Phone Numbers to DJ Profiles

1. Go to **Users** tab in the admin dashboard
2. Click **Edit** on a DJ user
3. Add their phone number in the "Phone Number" field
4. Format: `(555) 123-4567` or `5551234567` (both work)
5. Save the changes

### 6. Send Reminders

1. Go to the **Home** tab in the admin dashboard
2. Find the DJ you want to send a reminder to
3. Click the **📱 Send Reminder** button on their card
4. The SMS will be sent with details of their upcoming bookings

## SMS Message Format

The SMS message sent to DJs will look like:

```
Hi [DJ Name], you have X upcoming booking(s):

1. [Event Name] on MM-DD-YYYY at [Location]
2. [Event Name] on MM-DD-YYYY at [Location]
...

- Externally Yours Productions
```

## Phone Number Format

- The system accepts phone numbers in various formats:
  - `(555) 123-4567`
  - `555-123-4567`
  - `5551234567`
  - `+15551234567`
  
- For US numbers, if only 10 digits are provided, the system automatically adds the `+1` country code
- For international numbers, include the country code (e.g., `+44123456789`)

## Cost Considerations

### Twilio Pricing

- **Trial Account**: Free credits for testing (limited number of messages)
- **Paid Account**: 
  - US SMS: ~$0.0075 per message (less than 1 cent)
  - International SMS: Varies by country
  - Phone number: ~$1/month

### Tips to Minimize Costs

1. Send reminders only for upcoming bookings (not past ones)
2. Consider sending reminders only a few days before events
3. Limit the number of bookings included in each message (currently shows first 5)

## Troubleshooting

### "SMS service not configured" Error

- Check that all three environment variables are set in Vercel
- Ensure you've redeployed after adding environment variables
- Verify variable names match exactly: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

### "DJ phone number is required" Error

- Make sure the DJ has a phone number added in their user profile
- Go to Users tab → Edit DJ → Add phone number

### SMS Not Received

1. Check Twilio Console → **Monitor** → **Logs** → **Messaging**
2. Look for error messages or delivery failures
3. Verify the phone number format is correct
4. Check that your Twilio account has credits/balance
5. For trial accounts, verify the recipient number is verified

### Phone Number Format Issues

- US numbers should be 10 digits (area code + number)
- International numbers need country code (e.g., +44 for UK)
- The system will attempt to format numbers automatically

## Security Notes

- Never commit Twilio credentials to Git
- Always use environment variables for sensitive data
- Consider implementing rate limiting for SMS sending
- Add authentication checks to prevent unauthorized SMS sending

## Future Enhancements

Potential improvements:
- Scheduled reminders (e.g., 1 week before, 1 day before)
- Custom message templates
- Bulk reminders (send to all DJs at once)
- Email fallback if SMS fails
- Reminder preferences per DJ

