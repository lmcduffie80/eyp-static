/**
 * Security headers middleware for API endpoints
 * Import and use in API handlers to add security headers
 */

export function setSecurityHeaders(res) {
    // Content Security Policy - restrict resource loading
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
    );
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Prevent clickjacking attacks
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Enable XSS protection (legacy but still useful)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Control referrer information
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature-Policy)
    res.setHeader(
        'Permissions-Policy',
        'geolocation=(), microphone=(), camera=()'
    );
}

/**
 * CORS configuration with specific origins
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export function setCORSHeaders(req, res) {
    // Get allowed origins from environment variable or use default
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['https://eyp-static.vercel.app', 'http://localhost:3000'];
    
    const origin = req.headers.origin;
    
    // Allow requests from allowed origins
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins.length === 1 && allowedOrigins[0] === '*') {
        // Fallback to wildcard only if explicitly set (not recommended for production)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    // If origin doesn't match, don't set CORS header (browser will block)
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Allow credentials if using cookies for auth
    // res.setHeader('Access-Control-Allow-Credentials', 'true');
}

