# Next.js with Turbopack Setup

This project has been migrated to use Next.js with Turbopack for faster development and better performance.

## What's Changed

1. **Next.js 16** installed with React 19
2. **Turbopack** enabled for faster development builds
3. **App Router** structure in `/app` directory
4. **API Routes** remain in `/api` (Vercel serverless functions - compatible with Next.js)

## Development

### Start Development Server with Turbopack
```bash
npm run dev
```

This runs `next dev --turbo` which uses Turbopack for significantly faster builds.

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Use Vercel Dev (if needed)
```bash
npm run dev:vercel
```

## Project Structure

```
eyp-static/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   ├── globals.css        # Global styles
│   └── api/               # Next.js API routes (if migrated)
├── api/                   # Vercel serverless functions (existing)
├── public/                # Static assets (images, etc.)
└── next.config.js         # Next.js configuration
```

## Migration Notes

### Static Assets
- Move static assets (images, fonts, etc.) to the `/public` folder
- Reference them in code as `/filename.jpg` (Next.js serves from `/public`)

### API Routes
- Existing API routes in `/api` work with Vercel
- Can be migrated to `app/api/[route]/route.js` format if needed
- Current format: `export default async function handler(req, res)`
- Next.js format: `export async function GET(req)`, `export async function POST(req)`, etc.

### Pages Migration
- HTML pages need to be converted to React components
- Use Next.js `Link` component for navigation
- Use Next.js `Image` component for optimized images

## Next Steps

1. **Migrate HTML Pages**: Convert remaining HTML files to Next.js pages
   - `about.html` → `app/about/page.js`
   - `photography.html` → `app/photography/page.js`
   - `videography.html` → `app/videography/page.js`
   - `dj-login.html` → `app/dj-login/page.js`
   - etc.

2. **Move Static Assets**: Move images and other static files to `/public`

3. **Update API Routes** (Optional): Migrate API routes to Next.js format in `app/api`

4. **Environment Variables**: Ensure all environment variables are set in Vercel

## Turbopack Benefits

- **Faster builds**: Up to 10x faster than Webpack
- **Faster HMR**: Near-instant hot module replacement
- **Better performance**: Optimized bundling and tree-shaking

## Deployment

The project is configured for Vercel deployment. The existing API routes in `/api` will continue to work as Vercel serverless functions.

