# AWS RDS Database Setup - Complete! ✅

## What's Been Set Up

Your API endpoints are now configured to work with your **AWS RDS Postgres database** using IAM authentication through Vercel.

## Environment Variables (Already Set in Vercel)

Based on your configuration, these are already set:
- `AWS_ACCOUNT_ID="535356159919"`
- `AWS_REGION="us-east-1"`
- `AWS_RESOURCE_ARN="arn:aws:rds:us-east-1:535356159919:cluster:aws-apg-lime-chair"`
- `AWS_ROLE_ARN="arn:aws:iam::535356159919:role/Vercel/access-apg-lime-chair"`
- `PGDATABASE="postgres"`
- `PGHOST="aws-apg-lime-chair.cluster-ca9w6w0skroa.us-east-1.rds.amazonaws.com"`
- `PGPORT="5432"`
- `PGSSLMODE="require"`
- `PGUSER="postgres"`

## Next Steps

### 1. Run Database Schema

You need to create the tables in your database. Connect to your database and run `api/db/schema.sql`:

**Option A: Via Vercel Dashboard**
1. Go to Vercel Dashboard → Storage → Your Database
2. Click "Query" or "SQL Editor"
3. Copy contents of `api/db/schema.sql`
4. Paste and execute

**Option B: Via psql Command Line**
```bash
psql "host=aws-apg-lime-chair.cluster-ca9w6w0skroa.us-east-1.rds.amazonaws.com port=5432 dbname=postgres user=postgres sslmode=require"
```
Then paste the contents of `api/db/schema.sql`

**Option C: Via Database Client**
- Use a tool like DBeaver, pgAdmin, or TablePlus
- Connect to your RDS instance
- Run the SQL from `api/db/schema.sql`

### 2. Test the Connection

After deploying, test the database connection:
```
https://your-domain.vercel.app/api/test-db
```

Should return:
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "currentTime": "...",
    "postgresVersion": "..."
  }
}
```

### 3. Test API Endpoints

Test each endpoint:
- `GET /api/bookings` - Should return empty array `{"success":true,"data":[]}`
- `GET /api/users` - Should return users
- `GET /api/reviews` - Should return reviews
- `GET /api/blocked-dates` - Should return blocked dates

### 4. Migrate Existing Data (Optional)

If you have existing data in localStorage, you can migrate it:
- Export data from localStorage
- POST to `/api/migrate` endpoint
- See `BACKEND_DATABASE_SETUP.md` for details

## How It Works

The connection helper (`api/db/connection.js`) automatically:
1. Detects if you're using AWS RDS (checks for `AWS_ROLE_ARN`, `PGHOST`, etc.)
2. Uses AWS IAM authentication with RDS Signer
3. Creates a connection pool using the `pg` library
4. Handles token refresh (tokens expire after 15 minutes)
5. Returns data in the same format as `@vercel/postgres`

## Troubleshooting

### Error: "Failed to initialize AWS signer"
- Check that `AWS_ROLE_ARN` and other AWS variables are set
- Verify the IAM role has permissions to access RDS

### Error: "relation does not exist"
- You haven't run the schema.sql file yet
- Go back to Step 1

### Connection timeout
- Check security groups allow connections from Vercel
- Verify `PGHOST` is correct
- Check SSL mode settings

### Check Vercel Function Logs
- Go to Vercel Dashboard → Your Project → Deployments → Latest
- Click "Functions" → View logs
- Look for detailed error messages

## Ready to Use!

Once the schema is created, your API endpoints will work and data will sync across all devices! 🎉

Next: Update frontend code to use API instead of localStorage.

