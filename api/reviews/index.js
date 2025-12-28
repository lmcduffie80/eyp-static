// API endpoint for reviews
// GET /api/reviews - Get all reviews (optionally filtered by DJ)
// POST /api/reviews - Create new review

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
            // Get all reviews
            const { dj_username, status, service_type } = req.query; // Optional filters
            
            let query;
            // Build query with multiple filters if needed
            if (dj_username && status && service_type) {
                query = sql`SELECT * FROM reviews WHERE dj_username = ${dj_username} AND status = ${status} AND service_type = ${service_type} ORDER BY created_at DESC`;
            } else if (dj_username && status) {
                query = sql`SELECT * FROM reviews WHERE dj_username = ${dj_username} AND status = ${status} ORDER BY created_at DESC`;
            } else if (dj_username && service_type) {
                query = sql`SELECT * FROM reviews WHERE dj_username = ${dj_username} AND service_type = ${service_type} ORDER BY created_at DESC`;
            } else if (status && service_type) {
                query = sql`SELECT * FROM reviews WHERE status = ${status} AND service_type = ${service_type} ORDER BY created_at DESC`;
            } else if (dj_username) {
                query = sql`SELECT * FROM reviews WHERE dj_username = ${dj_username} ORDER BY created_at DESC`;
            } else if (status) {
                query = sql`SELECT * FROM reviews WHERE status = ${status} ORDER BY created_at DESC`;
            } else if (service_type) {
                query = sql`SELECT * FROM reviews WHERE service_type = ${service_type} ORDER BY created_at DESC`;
            } else {
                query = sql`SELECT * FROM reviews ORDER BY created_at DESC`;
            }
            
            const result = await query;
            
            return res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    djUsername: row.dj_username,
                    clientName: row.client_name,
                    rating: row.rating,
                    comment: row.comment,
                    eventName: row.event_name,
                    eventDate: row.event_date,
                    serviceType: row.service_type,
                    status: row.status || 'pending',
                    createdAt: row.created_at
                }))
            });

        } else if (req.method === 'POST') {
            // Create new review (defaults to 'pending' status for approval)
            const {
                djUsername,
                clientName,
                rating,
                comment,
                eventName,
                eventDate,
                serviceType
            } = req.body;

            // Validation
            if (!clientName || !comment) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: clientName, comment'
                });
            }

            const result = await sql`
                INSERT INTO reviews (
                    dj_username, client_name, rating, comment, event_name, event_date, service_type, status
                ) VALUES (
                    ${djUsername || null}, ${clientName}, ${rating || null}, ${comment},
                    ${eventName || null}, ${eventDate || null}, ${serviceType || null}, 'pending'
                ) RETURNING *
            `;

            const review = result.rows[0];
            return res.status(201).json({
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

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Reviews API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

