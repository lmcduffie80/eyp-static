# How to Add Environment Variables in Vercel

## Step-by-Step Guide

### Step 1: Navigate to Environment Variables

1. Go to https://vercel.com/dashboard
2. Click on your project (`eyp-static` or your project name)
3. Click on **Settings** (top navigation bar)
4. Click on **Environment Variables** (left sidebar)

### Step 2: Add Each Variable

For each environment variable, you need to fill in **TWO fields**:

#### Variable 1: Gmail Email Address

**Click "Add New" button, then:**

1. **Name field** (first box): Type exactly:
   ```
   GMAIL_USER
   ```

2. **Value field** (second box): Type your Gmail address:
   ```
   your-email@gmail.com
   ```
   (Replace `your-email@gmail.com` with your actual Gmail address)

3. **Environment checkboxes**: Select which environments to use:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

4. Click **Save**

---

#### Variable 2: Gmail App Password

**Click "Add New" button again, then:**

1. **Name field**: Type exactly:
   ```
   GMAIL_APP_PASSWORD
   ```

2. **Value field**: Paste your 16-character App Password:
   ```
   abcdefghijklmnop
   ```
   (This is the password you got from Google App Passwords - remove any spaces)

3. **Environment checkboxes**: Select the same environments as above

4. Click **Save**

---

#### Variable 3: Email From Address (Optional but Recommended)

**Click "Add New" button again, then:**

1. **Name field**: Type exactly:
   ```
   EMAIL_FROM
   ```

2. **Value field**: Type your email (usually same as GMAIL_USER):
   ```
   your-email@gmail.com
   ```

3. **Environment checkboxes**: Select the same environments

4. Click **Save**

---

#### Variable 4: Base URL (Optional but Recommended)

**Click "Add New" button again, then:**

1. **Name field**: Type exactly:
   ```
   BASE_URL
   ```

2. **Value field**: Type your Vercel deployment URL:
   ```
   https://eyp-static.vercel.app
   ```
   (Replace with your actual Vercel domain)

3. **Environment checkboxes**: Select the same environments

4. Click **Save**

---

## Complete List of Variables Needed

After adding all variables, you should see this list:

| Name | Value Example | Required? |
|------|--------------|-----------|
| `GMAIL_USER` | `your-email@gmail.com` | ✅ Yes |
| `GMAIL_APP_PASSWORD` | `abcdefghijklmnop` | ✅ Yes |
| `EMAIL_FROM` | `your-email@gmail.com` | ⚠️ Recommended |
| `BASE_URL` | `https://eyp-static.vercel.app` | ⚠️ Recommended |

---

## Common Mistakes to Avoid

### ❌ Wrong: Leaving Name Field Empty
- **Error:** "Please define a name for your Environment Variable"
- **Fix:** Always type a name in the first field before clicking Save

### ❌ Wrong: Using Spaces in Names
- **Wrong:** `GMAIL USER` (with space)
- **Right:** `GMAIL_USER` (with underscore)

### ❌ Wrong: Wrong Case
- **Wrong:** `gmail_user` (lowercase)
- **Right:** `GMAIL_USER` (uppercase)

### ❌ Wrong: Extra Spaces in Values
- **Wrong:** ` abcdefghijklmnop ` (with spaces)
- **Right:** `abcdefghijklmnop` (no spaces)

---

## After Adding Variables

1. **Redeploy your project:**
   - Go to **Deployments** tab
   - Click the three dots (⋯) on the latest deployment
   - Click **Redeploy**
   - OR just push a new commit to trigger a new deployment

2. **Verify variables are set:**
   - Go back to **Settings** → **Environment Variables**
   - You should see all your variables listed

3. **Test the password reset:**
   - Visit: `https://your-domain.vercel.app/dj-request-reset.html`
   - Enter an email and click "Send Reset Link"
   - Check your email inbox

---

## Troubleshooting

### "Variable not found" error
- Make sure variable names match exactly (case-sensitive)
- Make sure you selected the correct environment (Production)
- Redeploy after adding variables

### "Invalid credentials" error
- Double-check your Gmail App Password
- Make sure you removed all spaces from the App Password
- Verify 2-Step Verification is enabled on your Google account

### Variables not showing up
- Refresh the page
- Check you're in the right project
- Make sure you clicked "Save" after adding each variable

---

## Visual Guide

When adding a variable, the form should look like this:

```
┌─────────────────────────────────────────┐
│ Add Environment Variable                │
├─────────────────────────────────────────┤
│ Name:                                   │
│ ┌─────────────────────────────────────┐ │
│ │ GMAIL_USER                          │ │  ← Type the name here
│ └─────────────────────────────────────┘ │
│                                         │
│ Value:                                  │
│ ┌─────────────────────────────────────┐ │
│ │ your-email@gmail.com                │ │  ← Type the value here
│ └─────────────────────────────────────┘ │
│                                         │
│ Environments:                           │
│ ☐ Production  ☐ Preview  ☐ Development │  ← Check the boxes
│                                         │
│         [Cancel]  [Save]                │  ← Click Save
└─────────────────────────────────────────┘
```

**The error you saw means the "Name" field was empty!**

---

## Need Help?

If you're still having trouble:
1. Take a screenshot of your Environment Variables page
2. Check the Vercel logs for specific error messages
3. Verify your Gmail App Password was created correctly

