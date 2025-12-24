// Test database connection
// GET /api/test-db - Test if database connection works

import sql from './db/connection.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Test connection by querying current time
        const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
        
        return res.status(200).json({
            success: true,
            message: 'Database connection successful',
            data: {
                currentTime: result.rows[0].current_time,
                postgresVersion: result.rows[0].pg_version,
                environment: process.env.NODE_ENV || 'development'
            }
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

