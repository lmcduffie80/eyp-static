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
            // Update blocked date - can update status, djUser, reason, or date
            const { status, djUser, reason, date } = req.body;
            
            // Validate that at least one field is provided
            if (status === undefined && djUser === undefined && reason === undefined && date === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one field must be provided for update (status, djUser, reason, or date)'
                });
            }
            
            // Validate status if provided
            if (status !== undefined && !['pending', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid status is required: pending, approved, or rejected'
                });
            }
            
            // Try to update with updated_at column first, fall back gracefully if column doesn't exist
            let result;
            try {
                // Handle updates based on which fields are provided
                // Optimize for common case: status-only (approve/reject)
                if (status !== undefined && djUser === undefined && reason === undefined && date === undefined) {
                    // Status-only update (most common case for approve/reject)
                    result = await sql`
                        UPDATE blocked_dates 
                        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (djUser !== undefined && reason !== undefined && status === undefined && date === undefined) {
                    // djUser and reason only (edit case)
                    result = await sql`
                        UPDATE blocked_dates 
                        SET dj_user = ${djUser}, reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status !== undefined && djUser !== undefined && reason !== undefined && date === undefined) {
                    // status, djUser, reason
                    result = await sql`
                        UPDATE blocked_dates 
                        SET status = ${status}, dj_user = ${djUser}, reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status !== undefined && djUser !== undefined && reason === undefined && date === undefined) {
                    // status, djUser
                    result = await sql`
                        UPDATE blocked_dates 
                        SET status = ${status}, dj_user = ${djUser}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status !== undefined && djUser === undefined && reason !== undefined && date === undefined) {
                    // status, reason
                    result = await sql`
                        UPDATE blocked_dates 
                        SET status = ${status}, reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status === undefined && djUser !== undefined && reason === undefined && date === undefined) {
                    // djUser only
                    result = await sql`
                        UPDATE blocked_dates 
                        SET dj_user = ${djUser}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status === undefined && djUser === undefined && reason !== undefined && date === undefined) {
                    // reason only
                    result = await sql`
                        UPDATE blocked_dates 
                        SET reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status === undefined && djUser === undefined && reason === undefined && date !== undefined) {
                    // date only
                    result = await sql`
                        UPDATE blocked_dates 
                        SET date = ${date}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else {
                    // For other combinations, handle them explicitly or use a fallback
                    // For now, let's handle the most common edit case: djUser + reason
                    // If other fields are needed, we can add them
                    result = await sql`
                        UPDATE blocked_dates 
                        SET ${status !== undefined ? sql`status = ${status},` : sql``}
                            ${djUser !== undefined ? sql`dj_user = ${djUser},` : sql``}
                            ${reason !== undefined ? sql`reason = ${reason},` : sql``}
                            ${date !== undefined ? sql`date = ${date},` : sql``}
                            updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                }
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    try {
                        // Rebuild query without updated_at for each case
                        if (status !== undefined && djUser === undefined && reason === undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (djUser !== undefined && reason !== undefined && status === undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET dj_user = ${djUser}, reason = ${reason}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status !== undefined && djUser !== undefined && reason !== undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, dj_user = ${djUser}, reason = ${reason}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status !== undefined && djUser !== undefined && reason === undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, dj_user = ${djUser}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status !== undefined && djUser === undefined && reason !== undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, reason = ${reason}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status === undefined && djUser !== undefined && reason === undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET dj_user = ${djUser}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status === undefined && djUser === undefined && reason !== undefined && date === undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET reason = ${reason}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else if (status === undefined && djUser === undefined && reason === undefined && date !== undefined) {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET date = ${date}
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } else {
                            // Fallback: try without updated_at using conditional sql fragments
                            // Note: This syntax may not work perfectly, so we handle common cases above
                            throw new Error('Complex update not supported without updated_at column');
                        }
                    } catch (error) {
                        throw error;
                    }
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

