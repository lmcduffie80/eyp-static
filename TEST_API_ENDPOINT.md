# How to Test if the SMS API Endpoint is Working

## Step 1: Check if the Endpoint is Deployed

Open your browser and visit:
```
https://your-project.vercel.app/api/send-dj-reminder
```

**Expected result if deployed correctly:**
```json
{
  "success": true,
  "message": "Send DJ Reminder API is running",
  "timestamp": "2025-12-24T..."
}
```

**If you get a 404:**
- The function isn't deployed
- Check Vercel dashboard → Deployments → Latest deployment
- Make sure the deployment succeeded
- Check that `api/send-dj-reminder.js` exists in your repository

## Step 2: Check Browser Console

1. Open your admin dashboard
2. Open Browser Developer Tools (F12)
3. Go to Console tab
4. Click "Send Reminder" button
5. Look for any errors in the console

Common errors:
- `404 Not Found` - Function not deployed
- `CORS error` - CORS configuration issue
- `Failed to fetch` - Network error or endpoint doesn't exist
- `500 Internal Server Error` - Error in the function code

## Step 3: Check Network Tab

1. Open Browser Developer Tools (F12)
2. Go to Network tab
3. Click "Send Reminder" button
4. Look for the request to `/api/send-dj-reminder`
5. Click on it to see:
   - Request URL
   - Request Method (should be POST)
   - Status Code (200 = success, 404 = not found, 500 = server error)
   - Response body

## Step 4: Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to Logs tab
4. Click "Send Reminder" again
5. Look for error messages in the logs

## Step 5: Test with curl (Optional)

Test the endpoint directly with curl:

```bash
# Test GET (should return success message)
curl https://your-project.vercel.app/api/send-dj-reminder

# Test POST (will fail without valid data, but tests if endpoint exists)
curl -X POST https://your-project.vercel.app/api/send-dj-reminder \
  -H "Content-Type: application/json" \
  -d '{"djName":"Test","djPhone":"+15551234567","bookings":[]}'
```

Replace `your-project.vercel.app` with your actual Vercel domain.

## Common Issues

### Issue: "Failed to fetch"
**Possible causes:**
1. Endpoint not deployed (check Step 1)
2. Wrong domain/URL
3. CORS issue (shouldn't happen with our CORS headers)
4. Network/firewall blocking

**Solution:**
- Verify the endpoint exists using Step 1
- Check the Network tab to see the exact error
- Check Vercel logs for function errors

### Issue: 404 Not Found
**Cause:** Function not deployed or wrong path

**Solution:**
- Check that `api/send-dj-reminder.js` exists in your repo
- Check Vercel deployment succeeded
- Redeploy if needed

### Issue: 500 Internal Server Error
**Cause:** Error in the function code

**Solution:**
- Check Vercel function logs
- Check environment variables are set
- Verify Twilio credentials are correct

### Issue: "SMS service not configured"
**Cause:** Missing Twilio environment variables

**Solution:**
- Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in Vercel
- Redeploy after adding variables

