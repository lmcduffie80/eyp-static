# Troubleshooting "Failed to fetch" Error for SMS API

If you're getting a "Failed to fetch" error when clicking "Send Reminder", follow these steps:

## Step 1: Verify the API Endpoint is Deployed

1. **Check if the function file exists:**
   - The file should be at: `api/send-dj-reminder.js`
   - Make sure it's committed to your repository

2. **Verify deployment in Vercel:**
   - Go to your Vercel dashboard
   - Check the latest deployment
   - Look for any build errors related to the API function

3. **Test the endpoint directly:**
   - After deployment, visit: `https://your-project.vercel.app/api/send-dj-reminder`
   - You should see: `{"success":true,"message":"Send DJ Reminder API is running","timestamp":"..."}`
   - If you get a 404, the function isn't deployed correctly

## Step 2: Check Vercel Function Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Try clicking "Send Reminder" again
3. Look for errors in the logs
4. Common issues:
   - Missing environment variables
   - Runtime errors
   - Network errors when calling Twilio

## Step 3: Verify Environment Variables

Make sure these are set in Vercel:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

**Important:** After adding/changing environment variables, you MUST redeploy!

## Step 4: Check Browser Console

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Click "Send Reminder"
4. Look for any JavaScript errors
5. Go to Network tab
6. Look for the request to `/api/send-dj-reminder`
7. Check the response status and error message

## Step 5: Common Issues and Fixes

### Issue: "Failed to fetch" (Network Error)
**Cause:** API endpoint not accessible or not deployed
**Fix:**
- Verify the function is deployed in Vercel
- Check that the file is in the `api/` folder
- Redeploy your application

### Issue: "404 Not Found"
**Cause:** Function route not recognized by Vercel
**Fix:**
- Make sure the file is named exactly `send-dj-reminder.js`
- Verify it's in the `api/` folder (not `api-examples/`)
- Check `vercel.json` configuration

### Issue: "500 Internal Server Error"
**Cause:** Error in the function code
**Fix:**
- Check Vercel logs for the specific error
- Verify environment variables are set correctly
- Test the function locally if possible

### Issue: "SMS service not configured"
**Cause:** Missing Twilio environment variables
**Fix:**
- Add all three Twilio environment variables in Vercel
- Redeploy after adding variables

## Step 6: Test the Function Directly

You can test if the API is working by making a direct request:

```bash
# Test GET endpoint (should return success message)
curl https://your-project.vercel.app/api/send-dj-reminder

# Test POST endpoint (will fail without valid data, but should reach the function)
curl -X POST https://your-project.vercel.app/api/send-dj-reminder \
  -H "Content-Type: application/json" \
  -d '{"djName":"Test","djPhone":"+15551234567","bookings":[]}'
```

## Step 7: Local Testing (Optional)

If you want to test locally before deploying:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel dev`
3. Test at: `http://localhost:3000/api/send-dj-reminder`

## Still Not Working?

If none of these steps resolve the issue:

1. **Check Vercel Documentation:**
   - [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
   - [Vercel Function Logs](https://vercel.com/docs/concepts/functions/serverless-functions/debugging)

2. **Verify File Structure:**
   ```
   your-project/
   ├── api/
   │   └── send-dj-reminder.js  ← Must be here
   ├── admin-dashboard.html
   └── vercel.json (optional)
   ```

3. **Check the Function Export:**
   - Must use: `export default async function handler(req, res)`
   - Must be a default export
   - Must accept `req` and `res` parameters

## Quick Checklist

- [ ] Function file exists at `api/send-dj-reminder.js`
- [ ] Function uses `export default async function handler(req, res)`
- [ ] All Twilio environment variables are set in Vercel
- [ ] Application has been redeployed after adding variables
- [ ] GET request to `/api/send-dj-reminder` returns success message
- [ ] No errors in Vercel function logs
- [ ] No errors in browser console

