# Vercel Postgres Connection Guide

## Simple Approach (Recommended)

For **Vercel Postgres**, use the `@vercel/postgres` package which automatically handles authentication:

```javascript
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    try {
        const result = await sql`SELECT * FROM bookings`;
        return res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
```

This automatically uses environment variables that Vercel provides:
- `POSTGRES_URL` (connection string)
- Or individual variables: `POSTGRES_HOST`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, etc.

## Advanced Approach (AWS RDS)

The code you showed uses AWS RDS with IAM authentication. **Only use this if:**
- You're using an external AWS RDS database (not Vercel Postgres)
- You need IAM authentication
- You have AWS credentials configured

For Vercel Postgres, **stick with the simple `@vercel/postgres` approach**.

## Testing Your Connection

After setting up your database:

1. **Test the connection:**
   - Visit: `https://your-domain.vercel.app/api/test-db`
   - Should return: `{"success":true,"data":{...}}`

2. **Check environment variables:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Should see `POSTGRES_URL` and related variables

3. **Verify database tables:**
   - Run the schema.sql file in Vercel's SQL Editor
   - Tables should be created

## Troubleshooting

### Error: "Cannot find module '@vercel/postgres'"
- Make sure `@vercel/postgres` is in `package.json` dependencies
- Redeploy to Vercel

### Error: "relation does not exist"
- Run the schema.sql file to create tables
- See `DATABASE_SETUP_STEPS.md`

### Connection timeout/refused
- Check that database is created in Vercel
- Verify environment variables are set
- Check Vercel function logs for detailed errors

