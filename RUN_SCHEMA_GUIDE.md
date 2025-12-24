# Step-by-Step: How to Run the Database Schema

You have several options to run the schema. Choose the one that's easiest for you.

## Option 1: Using Vercel Dashboard SQL Editor (Easiest) ⭐ RECOMMENDED

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **eyp-static**

2. **Navigate to Storage**
   - Click **Storage** in the left sidebar
   - You should see your database: `aws-apg-lime-chair` (or similar name)
   - Click on it

3. **Open SQL Editor**
   - Click on the **"Data"** tab
   - Look for **"SQL Editor"** or **"Query"** button
   - Click it to open the SQL editor

4. **Copy the Schema**
   - Open the file `api/db/schema.sql` in your project
   - Select ALL the contents (Cmd+A or Ctrl+A)
   - Copy it (Cmd+C or Ctrl+C)

5. **Paste and Run**
   - Paste the schema into the SQL editor
   - Click **"Run"** or **"Execute"** button
   - Wait for it to complete (should take a few seconds)

6. **Verify Tables Were Created**
   - In the SQL editor, run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - You should see: `users`, `bookings`, `reviews`, `blocked_dates`, `analytics_visits`

✅ **Done!** Your database is ready.

---

## Option 2: Using a Database Client (pgAdmin, DBeaver, TablePlus, etc.)

### Step 1: Install a Database Client
Choose one:
- **TablePlus** (Mac/Windows): https://tableplus.com
- **DBeaver** (Free, all platforms): https://dbeaver.io
- **pgAdmin** (Free, all platforms): https://www.pgadmin.org

### Step 2: Get Connection Details from Environment Variables
You already have these:
```
Host: aws-apg-lime-chair.cluster-ca9w6w0skroa.us-east-1.rds.amazonaws.com
Port: 5432
Database: postgres
Username: postgres
SSL Mode: Require
```

**Note:** For AWS RDS with IAM authentication, you'll need to use IAM auth. Most clients don't support IAM auth directly, so Option 1 or Option 4 is better.

---

## Option 3: Using psql Command Line (Advanced)

If you have `psql` installed locally and can get an auth token:

```bash
# First, you'd need to get an IAM auth token (complex)
# This is not recommended unless you have AWS CLI configured
```

This method is complex because you need to generate IAM auth tokens. **Not recommended.**

---

## Option 4: Create Temporary API Endpoint to Run Schema ⭐ EASY

I'll create a temporary API endpoint that you can call once to run the schema.

1. **Deploy the code** (already done - it's pushed)
2. **Call the endpoint**: `https://your-domain.vercel.app/api/run-schema`
3. **Delete the endpoint** after use (for security)

Let me create this endpoint for you now...

