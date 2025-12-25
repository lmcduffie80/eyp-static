// API endpoint for bookings
// GET /api/bookings - Get all bookings
// POST /api/bookings - Create new booking

// Use connection helper that works with both Vercel Postgres and AWS RDS
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
            // Get all bookings
            const { dj_user } = req.query; // Optional filter by DJ
            
            let query = sql`SELECT * FROM bookings ORDER BY date DESC`;
            if (dj_user) {
                query = sql`SELECT * FROM bookings WHERE dj_user = ${dj_user} ORDER BY date DESC`;
            }
            
            const result = await query;
            
            return res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    djUser: row.dj_user,
                    clientName: row.client_name,
                    eventType: row.event_type,
                    date: row.date,
                    time: row.time,
                    location: row.location,
                    contactEmail: row.contact_email,
                    contactPhone: row.contact_phone,
                    notes: row.notes,
                    totalRevenue: row.total_revenue ? parseFloat(row.total_revenue) : null,
                    ccPayment: row.cc_payment ? parseFloat(row.cc_payment) : null,
                    payout: row.payout ? parseFloat(row.payout) : null
                }))
            });

        } else if (req.method === 'POST') {
            // Create new booking
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

            // Validation
            if (!djUser || !date || !eventType) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: djUser, date, eventType'
                });
            }

            const result = await sql`
                INSERT INTO bookings (
                    dj_user, client_name, event_type, date, time, location,
                    contact_email, contact_phone, notes, total_revenue, cc_payment, payout
                ) VALUES (
                    ${djUser}, ${clientName || null}, ${eventType}, ${date}, ${time || null},
                    ${location || null}, ${contactEmail || null}, ${contactPhone || null},
                    ${notes || null}, ${totalRevenue || null}, ${ccPayment || null}, ${payout || null}
                ) RETURNING *
            `;

            const booking = result.rows[0];
            return res.status(201).json({
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

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Bookings API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

