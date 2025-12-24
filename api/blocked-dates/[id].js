// API endpoint for individual blocked date operations
// DELETE /api/blocked-dates/[id] - Delete blocked date

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Blocked date ID is required' });
    }

    try {
        if (req.method === 'DELETE') {
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

