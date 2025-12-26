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
            
            // Build dynamic update query based on provided fields
            const updates = [];
            const values = [];
            let paramIndex = 1;
            
            if (status !== undefined) {
                if (!['pending', 'approved', 'rejected'].includes(status)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Valid status is required: pending, approved, or rejected'
                    });
                }
                updates.push(`status = $${paramIndex}`);
                values.push(status);
                paramIndex++;
            }
            
            if (djUser !== undefined) {
                updates.push(`dj_user = $${paramIndex}`);
                values.push(djUser);
                paramIndex++;
            }
            
            if (reason !== undefined) {
                updates.push(`reason = $${paramIndex}`);
                values.push(reason);
                paramIndex++;
            }
            
            if (date !== undefined) {
                updates.push(`date = $${paramIndex}`);
                values.push(date);
                paramIndex++;
            }
            
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one field must be provided for update (status, djUser, reason, or date)'
                });
            }
            
            // Build SET clause parts dynamically
            const setParts = [];
            if (status !== undefined) {
                setParts.push(sql`status = ${status}`);
            }
            if (djUser !== undefined) {
                setParts.push(sql`dj_user = ${djUser}`);
            }
            if (reason !== undefined) {
                setParts.push(sql`reason = ${reason}`);
            }
            if (date !== undefined) {
                setParts.push(sql`date = ${date}`);
            }
            
            // Try to update with updated_at column, fall back gracefully if column doesn't exist
            let result;
            try {
                // Build query with updated_at
                if (setParts.length > 0) {
                    setParts.push(sql`updated_at = CURRENT_TIMESTAMP`);
                }
                result = await sql`
                    UPDATE blocked_dates 
                    SET ${sql.join(setParts, sql`, `)}
                    WHERE id = ${id}
                    RETURNING *
                `;
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    try {
                        // Remove updated_at from setParts and try again
                        const setPartsWithoutUpdatedAt = setParts.filter(part => 
                            !part.strings || !part.strings.some(s => s.includes('updated_at'))
                        );
                        // Rebuild setParts without updated_at
                        const newSetParts = [];
                        if (status !== undefined) newSetParts.push(sql`status = ${status}`);
                        if (djUser !== undefined) newSetParts.push(sql`dj_user = ${djUser}`);
                        if (reason !== undefined) newSetParts.push(sql`reason = ${reason}`);
                        if (date !== undefined) newSetParts.push(sql`date = ${date}`);
                        
                        result = await sql`
                            UPDATE blocked_dates 
                            SET ${sql.join(newSetParts, sql`, `)}
                            WHERE id = ${id}
                            RETURNING *
                        `;
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

