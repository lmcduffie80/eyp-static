# Email Setup Quick Start Guide

## Quick Overview

The password reset email functionality is already built into your API. You just need to configure an email service. Here are your options:

### Option 1: Gmail SMTP (Easiest - Free)
- ✅ No additional service signup needed
- ✅ Uses your existing Gmail account
- ⚠️ Limited to 500 emails/day
- ⚠️ Requires Gmail App Password setup

### Option 2: SendGrid (Recommended for Production)
- ✅ Professional email service
- ✅ Free tier: 100 emails/day
- ✅ Better deliverability
- ⚠️ Requires account signup

### Option 3: AWS SES (Best for Scale)
- ✅ Very affordable ($0.10 per 1,000 emails)
- ✅ High deliverability
- ⚠️ Requires AWS account and setup

---

## 🚀 Quick Setup: Gmail (Recommended for Testing)

### Step 1: Create Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Click **App passwords** (under "How you sign in to Google")
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)** → Enter "DJ Portal"
5. Click **Generate**
6. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 2: Add Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`eyp-static`)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com
BASE_URL=https://eyp-static.vercel.app
```

**Important:** 
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the App Password from Step 1 (remove spaces)
- Use your actual Vercel deployment URL for `BASE_URL`

5. Click **Save** for each variable
6. Make sure to add them to **Production**, **Preview**, and **Development** environments (or just Production if you prefer)

### Step 3: Redeploy

1. Vercel will automatically redeploy when you add environment variables, OR
2. Go to **Deployments** tab and click **Redeploy** on the latest deployment

### Step 4: Test It!

**Important:** You must test on the deployed site, not by opening the file locally!

1. Visit your deployed site: `https://eyp-static.vercel.app/dj-request-reset.html`
   - **Don't** open the HTML file directly from your computer (file://)
   - This causes CORS errors because the API endpoint only works on the deployed server
2. Enter an email address
3. Click "Send Reset Link"
4. Check your email inbox (and spam folder)

**Note:** If you need to test locally, use Vercel's dev server:
```bash
npm run dev
# or
vercel dev
```
This will start a local server that mimics the deployed environment.

---

## 📧 Alternative: SendGrid Setup (For Production)

### Step 1: Create SendGrid Account

1. Sign up at https://sendgrid.com (free tier available)
2. Verify your email address
3. Go to **Settings** → **API Keys**
4. Click **Create API Key**
5. Name it: "DJ Portal Password Reset"
6. Select **Full Access** or **Mail Send** permissions
7. **Copy the API key** (you won't see it again!)

### Step 2: Verify Sender

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email address and verify it

### Step 3: Add Environment Variables in Vercel

Add these variables (instead of Gmail variables):

```
SENDGRID_API_KEY=SG.your_api_key_here
EMAIL_FROM=your-verified-email@example.com
BASE_URL=https://eyp-static.vercel.app
```

### Step 4: Install SendGrid Package

If using Vercel, add to `package.json`:

```json
{
  "dependencies": {
    "@sendgrid/mail": "^8.0.0"
  }
}
```

Then deploy. Vercel will automatically install it.

---

## 🔍 How It Works

The API code (`api/dj-reset-password.js`) automatically detects which email service you have configured:

1. **First**, it checks for Gmail credentials (`GMAIL_USER` + `GMAIL_APP_PASSWORD`)
2. **Then**, it checks for SendGrid (`SENDGRID_API_KEY`)
3. **Finally**, it checks for AWS SES (`AWS_SES_REGION`)

So just set up ONE of them, and the API will use it automatically!

---

## ⚙️ Current Configuration Check

Your API file already supports all three email services. The code is at:
- `api/dj-reset-password.js` - Sends the reset email
- `api/dj-reset-password-confirm.js` - Confirms password reset
- `api/dj-validate-reset-token.js` - Validates the reset token

---

## 🐛 Troubleshooting

### "No email service configured" error

- Check that environment variables are set correctly in Vercel
- Make sure you've redeployed after adding environment variables
- Verify variable names match exactly (case-sensitive)

### Gmail "Invalid login" error

- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password has no extra spaces

### Emails not arriving

- Check spam/junk folder
- Verify the email address is correct
- Check Vercel function logs for errors
- For Gmail: Make sure you're not hitting the daily limit (500 emails)

### API returns 404

- Make sure the API files are in the `/api` folder
- Verify you're using the correct URL path (`/api/dj-reset-password`)
- Check that Vercel is deploying the API folder correctly

---

## 📝 Next Steps (Optional)

1. **Add Database Storage**: Currently, reset tokens are only logged. For production, you'll need to:
   - Set up a database (Vercel Postgres, MongoDB Atlas, etc.)
   - Update the `checkUserExists()` and `storeResetToken()` functions in the API

2. **Password Hashing**: Currently using plain text passwords (for development). For production:
   - Implement bcrypt or similar for password hashing
   - Update both login and password reset endpoints

3. **Rate Limiting**: Add rate limiting to prevent abuse:
   - Limit password reset requests per email/IP
   - Implement exponential backoff

---

## ✅ Quick Checklist

- [ ] Choose email service (Gmail for testing, SendGrid for production)
- [ ] Set up App Password (Gmail) or API Key (SendGrid)
- [ ] Add environment variables in Vercel
- [ ] Redeploy application
- [ ] Test password reset flow
- [ ] Check email inbox (and spam folder)
- [ ] Verify reset link works

---

## 📚 More Information

- **Gmail Setup Details**: See `GMAIL_SETUP_GUIDE.md`
- **Full API Setup**: See `API_SETUP_GUIDE.md`
- **Security Best Practices**: See `SECURITY_AUDIT.md`

---

**Need Help?** Check the Vercel function logs in your dashboard to see detailed error messages.

