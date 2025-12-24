# Deployment Status Check Guide

This guide helps you verify that the HoneyBook sync API is properly deployed on Vercel.

## Quick Checklist

- [ ] Code is pushed to GitHub
- [ ] Vercel project is connected to GitHub repository
- [ ] API function exists in `api/honeybook-sync.js`
- [ ] Latest code is deployed on Vercel
- [ ] API endpoint is accessible via GET request
- [ ] API endpoint responds to POST requests

## Step-by-Step Verification

### 1. Check Local Files

Verify the API file exists locally:
```bash
ls -la api/honeybook-sync.js
```

The file should exist and have content.

### 2. Verify Git Status

Check that changes are committed and pushed:
```bash
git status
git log --oneline -5
```

All recent commits should be pushed to GitHub.

### 3. Check Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and log in
2. Navigate to your project (`eyp-static`)
3. Go to the **Functions** tab
4. Look for `api/honeybook-sync` in the list
5. Check the **Deployments** tab to ensure latest deployment succeeded

### 4. Test the API Endpoint

#### Option A: Browser Test

1. Open your deployed site: `https://your-project.vercel.app/test-api.html`
2. Or visit directly: `https://your-project.vercel.app/api/honeybook-sync`
3. You should see JSON response: `{"success": true, "message": "HoneyBook Sync API is running..."}`

#### Option B: Command Line Test

```bash
# Test GET request
curl https://your-project.vercel.app/api/honeybook-sync

# Test POST request
curl -X POST https://your-project.vercel.app/api/honeybook-sync \
  -H "Content-Type: application/json" \
  -d '{"projects": [], "manual_sync": true}'
```

#### Option C: Use Test Page

1. Deploy `test-api.html` (or access it if already deployed)
2. Open: `https://your-project.vercel.app/test-api.html`
3. Click the test buttons to verify API status

### 5. Check Deployment Logs

1. In Vercel Dashboard → Your Project
2. Go to **Deployments** tab
3. Click on the latest deployment
4. Check for any build errors or warnings
5. Go to **Functions** tab → `api/honeybook-sync` → **View Logs**

### 6. Verify Function Structure

The function should:
- Be in `api/` directory
- Export default async function handler
- Accept `req` and `res` parameters
- Handle GET, POST, and OPTIONS methods

### 7. Test from Admin Dashboard

1. Open: `https://your-project.vercel.app/admin-dashboard.html`
2. Navigate to "All Projects" tab
3. Click "Sync from HoneyBook" button
4. Check browser console (F12) for any errors
5. Should show success message or helpful error

## Common Issues and Solutions

### Issue: "Failed to fetch" Error

**Possible Causes:**
1. Function not deployed
2. Accessing from `file://` protocol
3. CORS issue
4. Wrong URL

**Solutions:**
- Verify deployment in Vercel Dashboard
- Access from deployed URL (not local file)
- Check function logs in Vercel
- Verify API endpoint URL is correct

### Issue: 404 Not Found

**Possible Causes:**
1. Function file not in correct location
2. Not deployed to Vercel
3. Wrong file structure

**Solutions:**
- Ensure file is at `api/honeybook-sync.js`
- Check Vercel deployment includes `api/` directory
- Verify file is committed to git

### Issue: Function Exists but Returns Error

**Possible Causes:**
1. Syntax error in function
2. Missing dependencies
3. Environment variable issues

**Solutions:**
- Check Vercel function logs
- Verify function syntax is correct
- Check for any required environment variables

## Deployment Commands

If using Vercel CLI:

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View function logs
vercel logs api/honeybook-sync
```

## Next Steps After Verification

Once deployment is verified:

1. **Set up Zapier Webhook:**
   - Create Zapier Zap
   - Configure webhook URL: `https://your-project.vercel.app/api/honeybook-sync`
   - Test with sample data

2. **Test Integration:**
   - Trigger Zapier test
   - Check Vercel function logs
   - Verify data transformation

3. **Configure Security (Optional):**
   - Set `HONEYBOOK_WEBHOOK_SECRET` in Vercel environment variables
   - Uncomment webhook secret verification in `api/honeybook-sync.js`

## Getting Help

If issues persist:

1. Check Vercel function logs
2. Review browser console errors
3. Test API endpoint directly
4. Verify all steps in this checklist

