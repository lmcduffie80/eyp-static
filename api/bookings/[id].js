// API endpoint for individual booking operations
// GET /api/bookings/[id] - Get single booking
// PUT /api/bookings/[id] - Update booking
// DELETE /api/bookings/[id] - Delete booking

import sql from '../db/connection.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'Booking ID is required' });
    }

    try {
        if (req.method === 'GET') {
            // Get single booking
            const result = await sql`SELECT * FROM bookings WHERE id = ${id}`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            const booking = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: booking.id,
                    djUser: booking.dj_user,
                    clientName: booking.client_name,
                    eventType: booking.event_type,
                    date: booking.date,
                    time: booking.time,
                    location: booking.location,
                    contactEmail: booking.contact_email,
                    contactPhone: booking.contact_phone,
                    notes: booking.notes,
                    totalRevenue: booking.total_revenue ? parseFloat(booking.total_revenue) : null,
                    ccPayment: booking.cc_payment ? parseFloat(booking.cc_payment) : null,
                    payout: booking.payout ? parseFloat(booking.payout) : null
                }
            });

        } else if (req.method === 'PUT') {
            // Update booking
            const {
                djUser,
                clientName,
                eventType,
                date,
                time,
                location,
                contactEmail,
                contactPhone,
                notes,
                totalRevenue,
                ccPayment,
                payout
            } = req.body;

            const result = await sql`
                UPDATE bookings SET
                    dj_user = ${djUser},
                    client_name = ${clientName || null},
                    event_type = ${eventType},
                    date = ${date},
                    time = ${time || null},
                    location = ${location || null},
                    contact_email = ${contactEmail || null},
                    contact_phone = ${contactPhone || null},
                    notes = ${notes || null},
                    total_revenue = ${totalRevenue || null},
                    cc_payment = ${ccPayment || null},
                    payout = ${payout || null},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING *
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            const booking = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: booking.id,
                    djUser: booking.dj_user,
                    clientName: booking.client_name,
                    eventType: booking.event_type,
                    date: booking.date,
                    time: booking.time,
                    location: booking.location,
                    contactEmail: booking.contact_email,
                    contactPhone: booking.contact_phone,
                    notes: booking.notes,
                    totalRevenue: booking.total_revenue ? parseFloat(booking.total_revenue) : null,
                    ccPayment: booking.cc_payment ? parseFloat(booking.cc_payment) : null,
                    payout: booking.payout ? parseFloat(booking.payout) : null
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete booking
            const result = await sql`DELETE FROM bookings WHERE id = ${id} RETURNING id`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'Booking not found' });
            }

            return res.status(200).json({
                success: true,
                message: 'Booking deleted successfully'
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Booking API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

