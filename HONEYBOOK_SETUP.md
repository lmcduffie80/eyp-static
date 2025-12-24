# HoneyBook Integration Setup Guide

This guide explains how to set up the HoneyBook integration to automatically sync project data to your Admin Dashboard.

## Overview

Since HoneyBook doesn't have a public API, we use **Zapier** as a bridge to send project data from HoneyBook to your dashboard via webhooks.

## Setup Steps

### 1. Create a Zapier Account

1. Go to [zapier.com](https://zapier.com) and create a free account
2. Navigate to "Create Zap"

### 2. Set Up the Zap

1. **Trigger (HoneyBook)**:
   - Choose "HoneyBook" as the trigger app
   - Select trigger: "New Project" or "Project Updated"
   - Connect your HoneyBook account
   - Test the trigger to ensure it works

2. **Action (Webhook)**:
   - Choose "Webhooks by Zapier" as the action app
   - Select action: "POST"
   - Set the URL to: `https://your-vercel-domain.vercel.app/api/honeybook-sync`
   - Set Method: POST
   - Set Data Pass-Through: Yes
   - Add Headers (optional):
     - `Content-Type: application/json`
   - In the "Data" field, map the HoneyBook project fields:
     ```json
     {
       "projects": [
         {
           "id": "{{Project ID}}",
           "project_name": "{{Project Name}}",
           "event_date": "{{Event Date}}",
           "location": "{{Location}}",
           "venue": "{{Venue}}",
           "client_name": "{{Client Name}}",
           "dj_payout": "{{DJ Payout}}",
           "total_revenue": "{{Total Revenue}}",
           "cc_payment": "{{Credit Card Payment}}",
           "assigned_to": "{{Assigned To}}",
           "notes": "{{Notes}}"
         }
       ],
       "webhook_secret": "your-secret-key-here"
     }
     ```

3. **Test the Zap**:
   - Run a test to ensure data is sent correctly
   - Check your Vercel function logs to verify data is received

### 3. Configure Environment Variables (Optional)

For added security, you can set a webhook secret:

1. In Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add: `HONEYBOOK_WEBHOOK_SECRET` = `your-secret-key-here`

2. Uncomment the webhook secret verification in `api/honeybook-sync.js`:
   ```javascript
   const expectedSecret = process.env.HONEYBOOK_WEBHOOK_SECRET;
   if (webhook_secret && webhook_secret !== expectedSecret) {
       return res.status(401).json({ 
           success: false, 
           message: 'Unauthorized' 
       });
   }
   ```

### 4. Field Mapping

The serverless function maps HoneyBook fields to your dashboard format:

| HoneyBook Field | Dashboard Field | Notes |
|----------------|----------------|-------|
| `project_name` or `title` | Project Name | |
| `event_date` or `date` | Date | Automatically formatted to YYYY-MM-DD |
| `location` or `venue` | Location | |
| `assigned_to` or `dj_name` | DJ User | |
| `dj_payout` or `payout` | DJ Payout | Currency formatted |
| `total_revenue` or `revenue` | Total Revenue | Currency formatted |
| `cc_payment` | CC Payment 6% | Currency formatted |
| `client_name` | Client Name | |
| `notes` | Notes | |

### 5. Manual Sync

If you prefer to sync manually:

1. Click the "Sync from HoneyBook" button in the Admin Dashboard
2. The function will check for any stored webhook data
3. Projects will be imported into your dashboard

### 6. Alternative: CSV Export

If you prefer not to use Zapier:

1. Export projects from HoneyBook as CSV
2. Use the "Import CSV" feature in the Admin Dashboard
3. Ensure your CSV has columns: Data (Date), DJ, Project, Location, Payment, CC Payment 6%, DJ Payout

## Troubleshooting

### "Failed to fetch" Error

If you see "Failed to fetch" when clicking "Sync from HoneyBook":

1. **Check Deployment**: Ensure the `api/honeybook-sync.js` function is deployed to Vercel
   - Push your code to GitHub (if using Git integration)
   - Or deploy via Vercel CLI: `vercel --prod`

2. **Check URL**: Make sure you're accessing the dashboard from the deployed Vercel URL, not `file://`
   - Local file access (`file://`) cannot make HTTP requests
   - Use: `https://your-project.vercel.app/admin-dashboard.html`

3. **Test the Endpoint**: 
   - Visit: `https://your-project.vercel.app/api/honeybook-sync` (GET request)
   - Should return: `{"success": true, "message": "HoneyBook Sync API is running..."}`
   - If you get 404, the function isn't deployed

4. **Check Browser Console**: 
   - Open Developer Tools (F12) → Console tab
   - Look for CORS errors or network errors
   - Check the Network tab to see if the request is being made

5. **Verify Function Exists**:
   - Check Vercel Dashboard → Your Project → Functions tab
   - Should see `api/honeybook-sync` listed

### Webhook Not Receiving Data

1. Check Zapier logs to ensure the Zap is running
2. Check Vercel function logs: `vercel logs` or Vercel Dashboard → Functions → View Logs
3. Verify the webhook URL is correct: `https://your-project.vercel.app/api/honeybook-sync`
4. Test the endpoint manually with a POST request:
   ```bash
   curl -X POST https://your-project.vercel.app/api/honeybook-sync \
     -H "Content-Type: application/json" \
     -d '{"projects": [], "manual_sync": true}'
   ```

### Data Not Appearing in Dashboard

1. Check browser console for errors
2. Verify the data format matches expected structure
3. Check that projects aren't being skipped as duplicates
4. Review the function logs for transformation errors
5. Check Vercel function logs to see what data Zapier is sending

### Date Format Issues

The function automatically converts dates to YYYY-MM-DD format. If dates are incorrect:
1. Check the original date format from HoneyBook
2. Verify the date field mapping in Zapier
3. Adjust the `formatDate()` function if needed

## Support

For issues or questions:
1. Check Vercel function logs: Vercel Dashboard → Your Project → Functions → api/honeybook-sync → View Logs
2. Review Zapier execution history
3. Test the API endpoint directly with Postman or curl
4. Check browser console for JavaScript errors

