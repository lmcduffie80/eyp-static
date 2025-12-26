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
            
            // Build SET clause dynamically - construct query string parts
            const setClauses = [];
            const setValues = [];
            let valueIndex = 1;
            
            if (status !== undefined) {
                setClauses.push(`status = $${valueIndex}`);
                setValues.push(status);
                valueIndex++;
            }
            if (djUser !== undefined) {
                setClauses.push(`dj_user = $${valueIndex}`);
                setValues.push(djUser);
                valueIndex++;
            }
            if (reason !== undefined) {
                setClauses.push(`reason = $${valueIndex}`);
                setValues.push(reason);
                valueIndex++;
            }
            if (date !== undefined) {
                setClauses.push(`date = $${valueIndex}`);
                setValues.push(date);
                valueIndex++;
            }
            
            // Try to update with updated_at column, fall back gracefully if column doesn't exist
            let result;
            try {
                // Build query with updated_at
                const queryWithUpdatedAt = `
                    UPDATE blocked_dates 
                    SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = $${valueIndex}
                    RETURNING *
                `;
                setValues.push(id);
                result = await sql.unsafe(queryWithUpdatedAt, setValues);
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    try {
                        const queryWithoutUpdatedAt = `
                            UPDATE blocked_dates 
                            SET ${setClauses.join(', ')}
                            WHERE id = $${valueIndex}
                            RETURNING *
                        `;
                        const valuesWithoutUpdatedAt = setValues.slice(0, -1); // Remove id, add it back
                        valuesWithoutUpdatedAt.push(id);
                        result = await sql.unsafe(queryWithoutUpdatedAt, valuesWithoutUpdatedAt);
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

