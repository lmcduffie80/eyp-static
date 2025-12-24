# Step-by-Step: Setting Up SMS Reminders in Vercel

This guide will walk you through setting up SMS reminders for DJ bookings in your Vercel deployment.

## Prerequisites

✅ You have a Twilio account  
✅ You have your **Account SID** and **Auth Token** from Twilio  
✅ You have a Vercel account and your project is deployed

---

## Step 1: Get a Twilio Phone Number

If you don't already have a Twilio phone number:

1. **Log in to Twilio Console**
   - Go to [console.twilio.com](https://console.twilio.com)
   - Sign in with your Twilio account

2. **Navigate to Phone Numbers**
   - In the left sidebar, click **Phone Numbers** → **Manage** → **Buy a Number**
   - Or go directly to: [twilio.com/console/phone-numbers/search](https://www.twilio.com/console/phone-numbers/search)

3. **Select a Phone Number**
   - Choose your country (United States)
   - Check the box for **SMS** capability (required)
   - Click **Search**
   - Select a phone number from the results
   - Click **Buy** (free trial accounts get one free number)

4. **Copy Your Phone Number**
   - After purchase, you'll see your number
   - Copy it in the format: `+1234567890` (with country code)
   - Example: `+15551234567`

---

## Step 2: Access Your Vercel Project Settings

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in to your account

2. **Select Your Project**
   - Click on your project name (likely `eyp-static` or similar)
   - You'll be taken to the project overview page

3. **Open Settings**
   - Click the **Settings** tab at the top of the page
   - In the left sidebar, click **Environment Variables**

---

## Step 3: Add Environment Variables

You need to add three environment variables. For each one:

1. **Click "Add New"** button (or "Add" button)

2. **Enter the variable details:**

   ### Variable 1: TWILIO_ACCOUNT_SID
   - **Key**: `TWILIO_ACCOUNT_SID`
   - **Value**: Paste your Twilio Account SID (starts with `AC...`)
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

   ### Variable 2: TWILIO_AUTH_TOKEN
   - **Key**: `TWILIO_AUTH_TOKEN`
   - **Value**: Paste your Twilio Auth Token (click "Reveal" in Twilio console if needed)
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

   ### Variable 3: TWILIO_PHONE_NUMBER
   - **Key**: `TWILIO_PHONE_NUMBER`
   - **Value**: Your Twilio phone number in format `+1234567890` (include the `+` and country code)
   - **Example**: `+15551234567`
   - **Environment**: Select **Production**, **Preview**, and **Development** (check all three)
   - Click **Save**

3. **Verify All Three Variables Are Added**
   - You should see all three in the list:
     - `TWILIO_ACCOUNT_SID`
     - `TWILIO_AUTH_TOKEN`
     - `TWILIO_PHONE_NUMBER`

---

## Step 4: Redeploy Your Application

**Important**: Environment variables only take effect after redeployment!

1. **Go to Deployments Tab**
   - Click the **Deployments** tab at the top of your project page

2. **Redeploy**
   - Find your latest deployment
   - Click the **three dots (⋯)** menu on the right
   - Select **Redeploy**
   - Or click **Redeploy** button if visible
   - Confirm the redeployment

3. **Wait for Deployment**
   - Wait for the deployment to complete (usually 1-2 minutes)
   - You'll see a green checkmark when it's done

---

## Step 5: Verify Environment Variables Are Active

1. **Check Deployment Logs** (Optional)
   - Click on your latest deployment
   - Check the build logs to ensure there are no errors

2. **Test the API Endpoint** (Optional)
   - You can test if the endpoint is accessible by visiting:
   - `https://your-project.vercel.app/api/send-dj-reminder`
   - It should return an error about missing data (which is expected - it means the endpoint is working)

---

## Step 6: Add Phone Numbers to DJ Profiles

Before you can send SMS reminders, DJs need phone numbers in their profiles:

1. **Go to Admin Dashboard**
   - Visit your deployed site: `https://your-project.vercel.app/admin-dashboard.html`
   - Log in as admin

2. **Navigate to Users Tab**
   - Click **Users** in the left sidebar

3. **Edit a DJ User**
   - Find a DJ in the list
   - Click the **Edit** button next to their name

4. **Add Phone Number**
   - Scroll to the **Phone Number** field
   - Enter the DJ's phone number
   - Format: `(555) 123-4567` or `5551234567` (both work)
   - Click **Save Changes**

5. **Repeat for All DJs**
   - Add phone numbers for all DJs who should receive reminders

---

## Step 7: Test SMS Reminder

1. **Go to Home Tab**
   - In the admin dashboard, click **Home** in the sidebar

2. **Find a DJ with Upcoming Bookings**
   - Look for a DJ card that shows upcoming bookings
   - The card should have a **📱 Send Reminder** button

3. **Send a Test Reminder**
   - Click the **📱 Send Reminder** button
   - Confirm the action in the popup
   - Wait for the success message

4. **Check the DJ's Phone**
   - The DJ should receive an SMS with their upcoming bookings
   - Message format:
     ```
     Hi [DJ Name], you have X upcoming booking(s):

     1. [Event] on MM-DD-YYYY at [Location]
     2. [Event] on MM-DD-YYYY at [Location]
     ...

     - Externally Yours Productions
     ```

---

## Troubleshooting

### "SMS service not configured" Error

**Problem**: The API returns this error when trying to send SMS.

**Solutions**:
1. ✅ Verify all three environment variables are set in Vercel
2. ✅ Check that you selected all environments (Production, Preview, Development)
3. ✅ **Redeploy your application** after adding variables
4. ✅ Verify variable names are exactly:
   - `TWILIO_ACCOUNT_SID` (not `TWILIO_ACCOUNT_SID_` or similar)
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### "Failed to send SMS" Error

**Problem**: API returns a failure message from Twilio.

**Solutions**:
1. ✅ Verify your Twilio Account SID and Auth Token are correct
2. ✅ Check your Twilio account has credits/balance
3. ✅ Verify the phone number format: `+1234567890` (with `+` and country code)
4. ✅ Check Twilio Console → Monitor → Logs for error details
5. ✅ For trial accounts: Verify the recipient phone number is verified in Twilio

### SMS Not Received

**Problem**: No SMS arrives at the DJ's phone.

**Solutions**:
1. ✅ Check Twilio Console → Monitor → Logs → Messaging
   - Look for delivery status
   - Check for error messages
2. ✅ Verify the DJ's phone number is correct in their profile
3. ✅ Check Twilio account balance (trial accounts have limits)
4. ✅ For trial accounts: The recipient number must be verified in Twilio Console
5. ✅ Check phone number format (should be 10 digits for US, or include country code)

### Phone Number Format Issues

**Problem**: Phone numbers aren't being recognized correctly.

**Solutions**:
- ✅ US numbers: Enter as `(555) 123-4567` or `5551234567`
- ✅ The system automatically adds `+1` for 10-digit US numbers
- ✅ International numbers: Include country code, e.g., `+44123456789`

---

## Quick Reference: Environment Variables Checklist

Before redeploying, verify you have:

- [ ] `TWILIO_ACCOUNT_SID` = `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- [ ] `TWILIO_AUTH_TOKEN` = `your_auth_token_here`
- [ ] `TWILIO_PHONE_NUMBER` = `+15551234567` (your Twilio number with `+` and country code)
- [ ] All three variables are set for **Production**, **Preview**, and **Development**
- [ ] You've clicked **Save** for each variable
- [ ] You've **redeployed** your application

---

## Cost Information

### Twilio Pricing (Approximate)

- **US SMS**: ~$0.0075 per message (less than 1 cent)
- **Phone Number**: ~$1/month
- **Trial Account**: Free credits for testing (limited messages)

### Tips to Minimize Costs

- Send reminders only for upcoming bookings (not past ones)
- Consider sending reminders only a few days before events
- The system shows first 5 bookings per message to keep messages concise

---

## Need Help?

If you encounter issues:

1. **Check Vercel Deployment Logs**
   - Go to your project → Deployments → Click latest deployment → View logs

2. **Check Twilio Console**
   - Go to Twilio Console → Monitor → Logs → Messaging
   - Look for error messages or delivery failures

3. **Test API Endpoint Directly**
   - Use a tool like Postman or curl to test the endpoint
   - Check browser console for JavaScript errors

4. **Verify Environment Variables**
   - In Vercel, go to Settings → Environment Variables
   - Confirm all three variables are present and correctly named

---

## Success!

Once everything is set up, you'll be able to:
- ✅ Send SMS reminders to DJs about their upcoming bookings
- ✅ See the "📱 Send Reminder" button on DJ cards with upcoming bookings
- ✅ Track SMS delivery in Twilio Console

Happy texting! 📱

