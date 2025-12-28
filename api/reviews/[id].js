// API endpoint for individual review operations
// PUT /api/reviews/[id] - Update review (e.g., change status)
// DELETE /api/reviews/[id] - Delete review

import sql from '../db/connection.js';
import { setSecurityHeaders, setCORSHeaders } from '../security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Review ID is required'
        });
    }

    try {
        if (req.method === 'GET') {
            // Get single review
            const result = await sql`
                SELECT * FROM reviews WHERE id = ${id}
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Review not found'
                });
            }

            const review = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: review.id,
                    djUsername: review.dj_username,
                    clientName: review.client_name,
                    rating: review.rating,
                    comment: review.comment,
                    eventName: review.event_name,
                    eventDate: review.event_date,
                    serviceType: review.service_type,
                    status: review.status,
                    createdAt: review.created_at
                }
            });

        } else if (req.method === 'PUT') {
            // Update review (primarily for status changes)
            const { status } = req.body;

            // Validate status if provided
            if (status !== undefined && !['pending', 'approved', 'rejected'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid status is required: pending, approved, or rejected'
                });
            }

            // Update status (most common use case - approve/reject)
            let result;
            if (status !== undefined) {
                result = await sql`
                    UPDATE reviews 
                    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${id}
                    RETURNING *
                `;
            } else {
                return res.status(400).json({
                    success: false,
                    error: 'Status field is required'
                });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Review not found'
                });
            }

            const review = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: review.id,
                    djUsername: review.dj_username,
                    clientName: review.client_name,
                    rating: review.rating,
                    comment: review.comment,
                    eventName: review.event_name,
                    eventDate: review.event_date,
                    serviceType: review.service_type,
                    status: review.status,
                    createdAt: review.created_at,
                    updatedAt: review.updated_at
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete review
            const result = await sql`
                DELETE FROM reviews WHERE id = ${id} RETURNING *
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Review not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Review API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

