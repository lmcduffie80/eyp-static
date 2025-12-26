# Twilio Setup Guide for SMS Reminders

This guide walks you through setting up Twilio to send SMS reminders to DJs.

## Step 1: Create Twilio Account

1. **Go to Twilio Website**
   - Visit: https://www.twilio.com
   - Click "Sign Up" or "Try Twilio Free"

2. **Sign Up Process**
   - Enter your email address
   - Create a password
   - Verify your email address
   - Fill in your account details (name, phone number)

3. **Verify Your Phone Number**
   - Twilio will send you a verification code via SMS
   - Enter the code to verify your number

## Step 2: Get Your Free Trial Credits

- New accounts get **$15.50 in free credits**
- This allows you to send approximately **1,000+ SMS messages** (varies by country)
- Enough to test and use the system for several months depending on usage

## Step 3: Get Your Account Credentials

Once logged in, you'll need these credentials:

### **Account SID and Auth Token**

1. **Go to Console Dashboard**
   - After logging in, you'll see your Dashboard
   - Or go to: https://console.twilio.com

2. **Find Your Credentials**
   - **Account SID**: Visible on the dashboard (starts with `AC...`)
   - **Auth Token**: Click the "show" button to reveal (starts with your auth token)
   - **Copy both** - you'll need these for environment variables

   **⚠️ Important**: Keep your Auth Token secret! Never commit it to public repositories.

## Step 4: Purchase a Phone Number

1. **Navigate to Phone Numbers**
   - In the left sidebar, click "Phone Numbers"
   - Then click "Buy a number" or "Get a number"

2. **Select Number Features**
   - Check "SMS" capability (required)
   - Select your country (United States recommended)
   - Optionally select your area/region

3. **Choose Your Number**
   - Browse available numbers
   - Click "Buy" next to your preferred number
   - Confirm purchase

4. **Phone Number Costs**
   - **$1/month** for the number (billed monthly)
   - **$0.0075 per SMS** sent (very affordable)
   - First $15.50 is free (covers ~2,000 SMS!)

## Step 5: Set Up Environment Variables

Add these to your Vercel project settings (or wherever you host):

### In Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

**Important Notes:**
- Replace `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- Replace `+1234567890` with your purchased Twilio phone number (include country code, e.g., +1 for US)
- Make sure to add these to all environments (Production, Preview, Development)

## Step 6: Test Your Setup

You can test by sending a test SMS:

```javascript
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    body: 'Test message from Twilio!',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1234567890' // Your phone number
  })
  .then(message => console.log(message.sid));
```

## Pricing Overview

### SMS Costs (US numbers)
- **Sending SMS**: $0.0075 per message
- **Receiving SMS**: $0.0075 per message (if you want two-way)
- **Phone Number**: $1/month

### Example Cost Calculation
- **10 DJ reminders/month**: ~$0.08/month (negligible!)
- **100 DJ reminders/month**: ~$0.75/month
- **1000 DJ reminders/month**: ~$7.50/month
- Plus $1/month for the phone number

**Very affordable even at scale!**

## Twilio Console Dashboard

Once set up, you can:
- View all sent messages (Logs → Messaging)
- Monitor usage and costs
- View phone number details
- Set up webhooks (for receiving SMS)
- Configure messaging services
- View analytics and reports

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use environment variables** only
3. **Rotate Auth Token** if compromised
4. **Use separate credentials** for dev/production if needed
5. **Enable two-factor authentication** on your Twilio account

## Quick Reference Links

- **Console Dashboard**: https://console.twilio.com
- **Documentation**: https://www.twilio.com/docs
- **SMS API Docs**: https://www.twilio.com/docs/sms
- **Pricing**: https://www.twilio.com/pricing
- **Support**: Available in console (help icon)

## Next Steps

Once you have Twilio set up, you can:
1. Integrate SMS into your reminder system
2. Send SMS reminders in addition to emails
3. Track delivery status
4. Handle two-way messaging (optional)

Would you like me to create the SMS reminder code that integrates with your existing system?

