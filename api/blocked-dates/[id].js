// API endpoint for individual blocked date operations
// DELETE /api/blocked-dates/[id] - Delete blocked date
// PUT /api/blocked-dates/[id] - Update blocked date (e.g., approve/reject)

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

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Blocked date ID is required' });
    }

    try {
        if (req.method === 'PUT') {
            // Update blocked date status (approve/reject)
            const { status } = req.body;

            if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid status is required: pending, approved, or rejected'
                });
            }

            // Try to update with status and updated_at columns, fall back gracefully if columns don't exist
            let result;
            try {
                // First try with both status and updated_at
                result = await sql`
                    UPDATE blocked_dates 
                    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${id}
                    RETURNING *
                `;
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    try {
                        result = await sql`
                            UPDATE blocked_dates 
                            SET status = ${status}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } catch (statusError) {
                        // If status column doesn't exist either, return error
                        if (statusError.message && statusError.message.includes('status')) {
                            return res.status(500).json({
                                success: false,
                                error: 'Database schema error: status column is missing. The database needs to be migrated.'
                            });
                        } else {
                            throw statusError;
                        }
                    }
                } else if (updateError.message && updateError.message.includes('status')) {
                    // If status column doesn't exist, return error
                    return res.status(500).json({
                        success: false,
                        error: 'Database schema error: status column is missing. The database needs to be migrated.'
                    });
                } else {
                    throw updateError; // Re-throw other errors
                }
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Blocked date not found' });
            }

            const blockedDate = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: blockedDate.id,
                    djUser: blockedDate.dj_user,
                    date: blockedDate.date,
                    reason: blockedDate.reason,
                    blockedBy: blockedDate.blocked_by,
                    status: blockedDate.status || 'approved',
                    createdAt: blockedDate.created_at,
                    updatedAt: blockedDate.updated_at
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete blocked date
            const result = await sql`DELETE FROM blocked_dates WHERE id = ${id} RETURNING id`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Blocked date not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Blocked date deleted successfully'
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Blocked date API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

