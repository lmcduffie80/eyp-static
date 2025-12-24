# How to Remove Vercel Login Prompt

If you're being prompted to sign into Vercel when accessing your site, it's because **Deployment Protection** is enabled. Here's how to fix it:

## Quick Fix: Use Production URL

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **eyp-static**
3. Look for the **Production** deployment (usually the first one or marked as "Production")
4. Click on it to see the URL
5. Use that URL instead of any preview URLs

**Example:**
- ❌ Preview URL (protected): `https://eyp-static-git-main-lee-mcduffies-projects.vercel.app`
- ✅ Production URL (public): `https://eyp-static.vercel.app`

## Option 1: Disable Deployment Protection (Recommended for Public Sites)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **eyp-static**
3. Go to **Settings** tab
4. Click **Deployment Protection** in the left sidebar
5. Under **Preview Deployments**, select:
   - **"No Protection"** - Makes all preview deployments public
   - OR **"Vercel Authentication"** with your team members only
6. Click **Save**
7. New deployments will now be accessible without login

**Note:** This only affects NEW deployments. Existing protected deployments will remain protected until you redeploy.

## Option 2: Set Production Domain (Recommended for Production Sites)

If you want your main site to be public but keep previews protected:

1. Go to **Settings** → **Domains**
2. Make sure you have a production domain set (e.g., `eyp-static.vercel.app`)
3. Production deployments are typically public by default
4. Only preview deployments will have protection

## Option 3: Protection Bypass Token (For Automation/Testing)

If you need to keep protection but allow programmatic access:

1. Go to **Settings** → **Deployment Protection**
2. Scroll to **"Protection Bypass for Automation"**
3. Click **Enable**
4. Copy the generated secret token
5. Add it to your URLs as a query parameter:
   ```
   https://your-deployment.vercel.app?x-vercel-protection-bypass=YOUR_SECRET
   ```

**⚠️ Security Warning:** Keep this token secret! Anyone with the token can bypass protection.

## Why Am I Seeing This?

- **Preview deployments** (from Git branches) often have protection enabled by default
- **Production deployments** (from main/master branch) are usually public
- Vercel adds protection to prevent unauthorized access to work-in-progress sites

## Which Option Should I Choose?

- **Public website?** → Use **Option 1** (Disable Protection) or use the **Production URL**
- **Private/internal site?** → Keep protection enabled, use **Option 3** (Bypass Token) for specific needs
- **Just want to access it?** → Use the **Production URL** (fastest solution)

## Still Having Issues?

1. Check which URL you're using (preview vs production)
2. Check Vercel Dashboard → Deployments → look for the Production deployment
3. Verify the deployment status (should show "Ready")
4. Try clearing your browser cache and cookies

