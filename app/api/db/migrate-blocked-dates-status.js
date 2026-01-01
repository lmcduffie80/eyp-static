// Migration script to add status column to blocked_dates table
// Run this once to add the status field to existing databases

import sql from '../connection.js';
import { setSecurityHeaders, setCORSHeaders } from '../security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers
    setCORSHeaders(req, res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Check if status column already exists
        const checkColumn = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'blocked_dates' AND column_name = 'status'
        `;

        if (checkColumn.rows.length === 0) {
            // Add status column with default value 'approved' for existing records
            await sql`
                ALTER TABLE blocked_dates 
                ADD COLUMN status VARCHAR(20) DEFAULT 'approved' 
                CHECK (status IN ('pending', 'approved', 'rejected'))
            `;

            // Update all existing records to 'approved' status
            await sql`
                UPDATE blocked_dates 
                SET status = 'approved' 
                WHERE status IS NULL
            `;

            return res.status(200).json({
                success: true,
                message: 'Status column added successfully. All existing blocked dates set to approved.'
            });
        } else {
            return res.status(200).json({
                success: true,
                message: 'Status column already exists'
            });
        }
    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Migration failed'
        });
    }
}

