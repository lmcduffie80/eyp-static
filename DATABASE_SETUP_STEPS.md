# Step-by-Step Database Setup Instructions

Follow these steps to set up your backend database on Vercel.

## Step 1: Create Postgres Database on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project: **eyp-static**
3. Click on the **Storage** tab (in the left sidebar)
4. Click **Create Database**
5. Select **Postgres**
6. Name it: `eyp-database` (or any name you prefer)
7. Select a region (choose the one closest to your users)
8. Click **Create**
9. Wait 1-2 minutes for the database to be created

## Step 2: Run Database Schema

1. In Vercel Dashboard, go to **Storage** → **eyp-database**
2. Click on the **Data** tab
3. Click on **SQL Editor** (or **Query** tab)
4. Open the file `api/db/schema.sql` from your project
5. Copy the entire contents of `schema.sql`
6. Paste it into the SQL editor in Vercel
7. Click **Run** or **Execute**
8. Verify that all tables were created successfully

You should see these tables created:
- `users`
- `bookings`
- `reviews`
- `blocked_dates`
- `analytics_visits`

## Step 3: Verify Environment Variables

Vercel automatically creates environment variables when you create a Postgres database. To verify:

1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. You should see these variables (they're automatically set):
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

✅ These are automatically available to your serverless functions - no action needed!

## Step 4: Install Dependencies

The `package.json` has been updated with `@vercel/postgres`. Vercel will automatically install it on deployment, but if you want to test locally:

```bash
npm install
```

## Step 5: Deploy to Vercel

1. Commit and push your changes to GitHub (already done)
2. Vercel will automatically deploy
3. Wait for deployment to complete (~2-3 minutes)

## Step 6: Test API Endpoints

After deployment, test the API endpoints:

1. Go to your deployed site: `https://eyp-static.vercel.app` (or your domain)
2. Test the bookings endpoint:
   - `https://eyp-static.vercel.app/api/bookings`
   - Should return: `{"success":true,"data":[]}` (empty array initially)

3. Test other endpoints:
   - `/api/reviews`
   - `/api/users`
   - `/api/blocked-dates`

## Step 7: Migrate Existing Data (Optional)

If you have existing data in localStorage, you can migrate it:

1. **Export localStorage data** from your browser:
   - Open DevTools (F12)
   - Go to Application → Local Storage
   - Copy the JSON values for:
     - `dj_bookings`
     - `dj_reviews`
     - `dj_users`
     - `blocked_dates`

2. **Create a migration JSON file**:
   ```json
   {
     "bookings": [...],
     "reviews": [...],
     "users": [...],
     "blockedDates": [...]
   }
   ```

3. **Import via API**:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/migrate \
     -H "Content-Type: application/json" \
     -d @migration-data.json
   ```

   Or use a tool like Postman to POST the JSON data to `/api/migrate`

## Step 8: Update Frontend Code

The next step is to update `admin-dashboard.html` and `dj-dashboard.html` to use the API endpoints instead of localStorage. This will be done in a separate update.

## Troubleshooting

### Error: "Cannot find module '@vercel/postgres'"
- Make sure `package.json` includes `@vercel/postgres` in dependencies
- Redeploy to Vercel

### Error: "relation 'bookings' does not exist"
- You haven't run the schema.sql file yet
- Go back to Step 2 and run the SQL schema

### API returns 500 error
- Check Vercel function logs: **Deployments** → Latest → **Functions** → View Logs
- Look for error messages in the logs

### Database connection errors
- Verify environment variables are set (Step 3)
- Make sure you selected the correct database in Storage tab

## Next Steps

Once the database is set up and API endpoints are working:

1. ✅ Update admin-dashboard.html to use API
2. ✅ Update dj-dashboard.html to use API
3. ✅ Test full workflow
4. ✅ Remove localStorage fallback code

Let me know when you've completed Steps 1-6 and I'll help with the frontend updates!

