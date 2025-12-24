# Backend Database Setup Guide

This guide will help you set up a backend database solution using Vercel Postgres to replace localStorage, allowing data to sync across all devices.

## Prerequisites

- Vercel account (you already have this)
- GitHub repository connected to Vercel
- Node.js installed locally (for development)

## Step 1: Install Vercel Postgres

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your project: **eyp-static**
3. Go to **Storage** tab (in left sidebar)
4. Click **Create Database**
5. Select **Postgres**
6. Choose a name (e.g., `eyp-database`)
7. Select a region (choose closest to your users)
8. Click **Create**
9. Wait for database to be created (~1-2 minutes)

## Step 2: Install Required Packages

You'll need to add these packages to your project:

```bash
npm install @vercel/postgres
```

Add this to your `package.json`:

```json
{
  "dependencies": {
    "@vercel/postgres": "^0.11.0"
  }
}
```

## Step 3: Environment Variables

Vercel automatically creates environment variables when you create a Postgres database. Check:

1. Go to **Settings** → **Environment Variables**
2. You should see variables like:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

These are automatically available to your serverless functions.

## Step 4: Database Schema

We'll create tables for:
- `users` (DJ users and admin users)
- `bookings` (projects/bookings)
- `reviews` (DJ reviews)
- `blocked_dates` (DJ blocked dates)

## Step 5: API Endpoints Structure

Create these API endpoints in the `api/` folder:

```
api/
  ├── bookings/
  │   ├── index.js (GET all, POST new)
  │   └── [id].js (GET one, PUT update, DELETE)
  ├── reviews/
  │   └── index.js (GET all, POST new)
  ├── users/
  │   └── index.js (GET all, POST new, PUT update)
  └── blocked-dates/
      ├── index.js (GET all, POST new)
      └── [id].js (DELETE)
```

## Step 6: Update Frontend Code

Replace all `localStorage.getItem()` and `localStorage.setItem()` calls with API fetch calls.

Example:
- `localStorage.getItem('dj_bookings')` → `fetch('/api/bookings')`
- `localStorage.setItem('dj_bookings', data)` → `fetch('/api/bookings', { method: 'POST', body: data })`

## Migration Strategy

Since you already have data in localStorage, we'll:

1. Create API endpoints first
2. Add a migration script to export localStorage data
3. Create import endpoint to load existing data
4. Update frontend gradually (can work with both localStorage and API during transition)

## Next Steps

1. ✅ Create database schema SQL file
2. ✅ Create API endpoints
3. ✅ Create migration/import script
4. ✅ Update frontend code to use API
5. ✅ Test on Vercel deployment

Let's start implementing!

