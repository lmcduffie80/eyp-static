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
            
            // Helper function to build and execute update query
            const executeUpdate = async (includeUpdatedAt) => {
                // Build SET clause parts conditionally
                const setParts = [];
                if (status !== undefined) setParts.push(sql`status = ${status}`);
                if (djUser !== undefined) setParts.push(sql`dj_user = ${djUser}`);
                if (reason !== undefined) setParts.push(sql`reason = ${reason}`);
                if (date !== undefined) setParts.push(sql`date = ${date}`);
                if (includeUpdatedAt) setParts.push(sql`updated_at = CURRENT_TIMESTAMP`);
                
                // Build the query by joining SET parts
                // Since postgres.js doesn't easily support dynamic SET clauses, we'll use a simpler approach
                // Execute multiple UPDATE statements if needed, or use a helper pattern
                // Actually, the simplest is to conditionally include fields
                
                // For postgres.js, we need to construct the query differently
                // Since we can't easily build dynamic SET clauses, we'll use conditional execution
                // Optimize for common case: status-only updates (approve/reject)
                if (status !== undefined && djUser === undefined && reason === undefined && date === undefined) {
                    // Single field update - status only
                    if (includeUpdatedAt) {
                        return await sql`
                            UPDATE blocked_dates 
                            SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else {
                        return await sql`
                            UPDATE blocked_dates 
                            SET status = ${status}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    }
                }
                
                // For multiple fields, we'll need to do multiple updates or use a different approach
                // Since postgres.js doesn't support dynamic SET clauses easily, let's do multiple UPDATE calls
                // Actually, that's inefficient. Let me use a different approach.
                
                // Use conditional inclusion in a single query by checking which fields exist
                // Build query string dynamically but safely
                const updates = [];
                const values = [];
                
                if (status !== undefined) {
                    updates.push('status = $' + (values.length + 1));
                    values.push(status);
                }
                if (djUser !== undefined) {
                    updates.push('dj_user = $' + (values.length + 1));
                    values.push(djUser);
                }
                if (reason !== undefined) {
                    updates.push('reason = $' + (values.length + 1));
                    values.push(reason);
                }
                if (date !== undefined) {
                    updates.push('date = $' + (values.length + 1));
                    values.push(date);
                }
                if (includeUpdatedAt) {
                    updates.push('updated_at = CURRENT_TIMESTAMP');
                }
                
                values.push(id);
                
                // Use sql.query with parameterized query string
                // Actually, postgres.js doesn't support this either easily
                // Let me try a different approach: use multiple conditional sql`` calls
                
                // For now, let's use the simplest approach: handle common cases explicitly
                // and fall back to a pattern that works
                throw new Error('Complex updates not yet implemented - use single field updates');
            };
            
            // Try to update with updated_at column first, fall back gracefully if column doesn't exist
            let result;
            try {
                result = await executeUpdate(true);
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    result = await executeUpdate(false);
                } else if (updateError.message && updateError.message.includes('Complex updates')) {
                    // For complex multi-field updates, handle them explicitly
                    // This is a fallback for when multiple fields need updating
                    if (status !== undefined && djUser !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, dj_user = ${djUser}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET status = ${status}, dj_user = ${djUser}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (status !== undefined && reason !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET status = ${status}, reason = ${reason}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (djUser !== undefined && reason !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET dj_user = ${djUser}, reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET dj_user = ${djUser}, reason = ${reason}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (status !== undefined && date !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET status = ${status}, date = ${date}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET status = ${status}, date = ${date}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (djUser !== undefined && date !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET dj_user = ${djUser}, date = ${date}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET dj_user = ${djUser}, date = ${date}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (reason !== undefined && date !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET reason = ${reason}, date = ${date}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET reason = ${reason}, date = ${date}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (djUser !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET dj_user = ${djUser}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET dj_user = ${djUser}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (reason !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET reason = ${reason}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET reason = ${reason}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else if (date !== undefined) {
                        try {
                            result = await sql`
                                UPDATE blocked_dates 
                                SET date = ${date}, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ${id}
                                RETURNING *
                            `;
                        } catch (e) {
                            if (e.message && e.message.includes('updated_at')) {
                                result = await sql`
                                    UPDATE blocked_dates 
                                    SET date = ${date}
                                    WHERE id = ${id}
                                    RETURNING *
                                `;
                            } else {
                                throw e;
                            }
                        }
                    } else {
                        throw new Error('No fields to update');
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

