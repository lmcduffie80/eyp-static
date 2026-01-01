// API endpoint to run the reviews migration
// GET /api/migrate-reviews - Run the migration to add status and service_type columns

import migrateReviews from './db/migrate-reviews.js';
import { setSecurityHeaders, setCORSHeaders } from './security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const result = await migrateReviews();
        return res.status(200).json({
            success: true,
            message: result.message || 'Migration completed successfully',
            details: result.details || []
        });
    } catch (error) {
        console.error('Migration API error:', error);
        const errorMessage = error.message || 'Migration failed';
        return res.status(500).json({
            success: false,
            error: errorMessage,
            details: error.stack || 'No additional details available'
        });
    }
}

