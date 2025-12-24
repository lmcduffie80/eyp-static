# How to Pull Environment Variables from Vercel

To pull environment variables from your Vercel project for local development:

## Step 1: Login to Vercel CLI

Run this command and follow the prompts:

```bash
npx vercel login
```

This will:
1. Open your browser
2. Ask you to authorize the Vercel CLI
3. Complete the login process

## Step 2: Link Your Project (if needed)

If this is the first time using Vercel CLI in this directory:

```bash
npx vercel link
```

Follow the prompts to:
1. Select your account
2. Select your project (eyp-static)

## Step 3: Pull Environment Variables

Once logged in and linked, run:

```bash
npx vercel env pull
```

Or to pull from a specific environment:

```bash
npx vercel env pull .env.local
```

This will create a `.env.local` file in your project root with all the environment variables from Vercel, including:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- And any other environment variables you've set

## Step 4: Add .env.local to .gitignore

Make sure `.env.local` is in your `.gitignore` file to keep secrets safe:

```
.env.local
.env
*.local
```

## Using Environment Variables

Once you have the `.env.local` file, you can test your API endpoints locally using:

```bash
npx vercel dev
```

This will start a local development server that uses your Vercel environment variables.

