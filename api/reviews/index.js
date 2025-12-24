// API endpoint for reviews
// GET /api/reviews - Get all reviews (optionally filtered by DJ)
// POST /api/reviews - Create new review

import sql from '../db/connection.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Get all reviews
            const { dj_username } = req.query; // Optional filter by DJ
            
            let query = sql`SELECT * FROM reviews ORDER BY created_at DESC`;
            if (dj_username) {
                query = sql`SELECT * FROM reviews WHERE dj_username = ${dj_username} ORDER BY created_at DESC`;
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
                    createdAt: row.created_at
                }))
            });

        } else if (req.method === 'POST') {
            // Create new review
            const {
                djUsername,
                clientName,
                rating,
                comment,
                eventName,
                eventDate
            } = req.body;

            // Validation
            if (!djUsername || !clientName) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: djUsername, clientName'
                });
            }

            const result = await sql`
                INSERT INTO reviews (
                    dj_username, client_name, rating, comment, event_name, event_date
                ) VALUES (
                    ${djUsername}, ${clientName}, ${rating || null}, ${comment || null},
                    ${eventName || null}, ${eventDate || null}
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

