/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for faster development builds
  // Turbopack is automatically used when running `next dev --turbo`
  
  // Output configuration - keep static export if needed, or use default
  // output: 'standalone', // or 'export' for static export
  
  // Image optimization
  images: {
    unoptimized: false, // Set to true if you need to disable image optimization
    domains: [],
    remotePatterns: [],
  },
  
  // API routes configuration
  async rewrites() {
    return [
      // Keep existing API routes accessible
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
      // Rewrite /admin-dashboard to serve the HTML file from public folder
      {
        source: '/admin-dashboard',
        destination: '/admin-dashboard.html',
      },
    ];
  },
  
  // Environment variables that should be available to the client
  env: {
    // Add any public env vars here if needed
  },
  
  // Turbopack configuration
  turbopack: {
    // Add custom Turbopack config here if needed
  },
  
  // Experimental features
  experimental: {
    // Turbopack is enabled by default in Next.js 16
  },
};

module.exports = nextConfig;

