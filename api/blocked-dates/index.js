// API endpoint for blocked dates
// GET /api/blocked-dates - Get all blocked dates (optionally filtered by DJ)
// POST /api/blocked-dates - Create new blocked date

import sql from '../db/connection.js';
import { setSecurityHeaders, setCORSHeaders } from '../security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers with specific origins
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all blocked dates
            const { dj_user } = req.query; // Optional filter by DJ
            
            let query = sql`SELECT * FROM blocked_dates ORDER BY date ASC`;
            if (dj_user) {
                query = sql`SELECT * FROM blocked_dates WHERE dj_user = ${dj_user} ORDER BY date ASC`;
            }
            
            const result = await query;
            
            return res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    djUser: row.dj_user,
                    date: row.date,
                    reason: row.reason,
                    blockedBy: row.blocked_by,
                    status: row.status || 'approved', // Default to 'approved' for backward compatibility
                    createdAt: row.created_at
                }))
            });

        } else if (req.method === 'POST') {
            // Create new blocked date
            const {
                djUser,
                date,
                reason,
                blockedBy
            } = req.body;

            // Validation
            if (!djUser || !date) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: djUser, date'
                });
            }

            // Check if date is already blocked for this DJ (only check approved or pending)
            const existing = await sql`
                SELECT id FROM blocked_dates 
                WHERE dj_user = ${djUser} AND date = ${date} 
                AND (status = 'approved' OR status = 'pending' OR status IS NULL)
            `;
            if (existing.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Date is already blocked or pending for this DJ'
                });
            }

            // New blocked dates default to 'pending' status (requires admin approval)
            const result = await sql`
                INSERT INTO blocked_dates (dj_user, date, reason, blocked_by, status)
                VALUES (${djUser}, ${date}, ${reason || null}, ${blockedBy || djUser}, 'pending')
                RETURNING *
            `;

            const blockedDate = result.rows[0];
            return res.status(201).json({
                success: true,
                data: {
                    id: blockedDate.id,
                    djUser: blockedDate.dj_user,
                    date: blockedDate.date,
                    reason: blockedDate.reason,
                    blockedBy: blockedDate.blocked_by,
                    status: blockedDate.status || 'pending',
                    createdAt: blockedDate.created_at
                }
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Blocked dates API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

