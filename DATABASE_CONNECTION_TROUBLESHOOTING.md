# Database Connection Troubleshooting Guide

## Error: "PAM authentication failed for user postgres"

This error indicates that the database connection is failing to authenticate. This guide will help you diagnose and fix the issue.

## Quick Diagnosis

The error typically means one of these scenarios:

1. **Using AWS RDS but database isn't configured for IAM authentication**
2. **Missing or incorrect POSTGRES_URL for Vercel Postgres**
3. **Database connection credentials are incorrect or expired**

## Solution: Verify Vercel Environment Variables

Based on your setup, you should be using **Vercel Postgres** (simpler and recommended). Follow these steps:

### Step 1: Check if POSTGRES_URL is Set

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`eyp-static`)
3. Go to **Settings** → **Environment Variables**
4. Look for `POSTGRES_URL`

### Step 2: If POSTGRES_URL is Missing

If `POSTGRES_URL` is not set, you need to connect your Vercel Postgres database:

1. In Vercel Dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Select a name (e.g., `eyp-database`)
4. Choose a region
5. Click **Create**

After creating the database, Vercel will automatically create these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Step 3: Initialize the Database Schema

Once your database is connected, you need to run the schema:

1. Use the Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   ```

2. Then run the schema initialization:
   ```bash
   # You may need to create a migration script or use psql
   # The schema is in api/db/schema.sql
   ```

Or use Vercel's database dashboard to run the SQL from `api/db/schema.sql`.

### Step 4: Redeploy

After setting up the database:
1. Go to **Deployments** tab
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a redeploy

## If Using AWS RDS Instead

If you prefer to use AWS RDS with IAM authentication, you need to set ALL of these environment variables:

- `AWS_ROLE_ARN` - Your AWS IAM role ARN
- `PGHOST` - Your RDS instance endpoint
- `PGUSER` - Database username (must be configured for IAM auth)
- `PGDATABASE` - Database name (defaults to "postgres" if not set)
- `PGPORT` - Database port (defaults to 5432 if not set)
- `AWS_REGION` - AWS region (defaults to "us-east-1" if not set)

**Important:** The database user must be configured for IAM authentication, not password authentication. The PAM error suggests the database is trying to use password/PAM auth instead of IAM.

## How to Check Which Connection Method is Being Used

The code automatically chooses based on environment variables:

1. **If `POSTGRES_URL` exists** → Uses Vercel Postgres (`@vercel/postgres`)
2. **If AWS credentials exist** → Uses AWS RDS with IAM authentication
3. **If neither exists** → Throws error

## Testing the Connection

After fixing the environment variables, test the connection:

1. Try creating a blocked date in the DJ dashboard
2. Check Vercel function logs for any connection errors
3. Verify the data appears in your database

## Common Issues

### Issue: "PAM authentication failed"
- **Cause:** Database is configured for password/PAM auth but code is using IAM auth (or vice versa)
- **Fix:** Use Vercel Postgres (set `POSTGRES_URL`) OR configure AWS RDS for IAM authentication

### Issue: "No database connection configured"
- **Cause:** Neither `POSTGRES_URL` nor AWS credentials are set
- **Fix:** Set up Vercel Postgres database (recommended)

### Issue: "Failed to create AWS RDS connection pool"
- **Cause:** AWS credentials are incomplete or incorrect
- **Fix:** Verify all AWS environment variables are set correctly, or switch to Vercel Postgres

## Recommended Solution

**Use Vercel Postgres** - It's simpler, automatically managed, and doesn't require AWS configuration:

1. Create a Postgres database in Vercel Storage
2. Vercel automatically sets `POSTGRES_URL`
3. Run the schema from `api/db/schema.sql`
4. Redeploy your application

That's it! No AWS configuration needed.

