// Migration endpoint to import data from localStorage JSON
// POST /api/migrate - Import data from localStorage export

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { bookings, reviews, users, blockedDates } = req.body;

        const results = {
            bookings: { imported: 0, errors: [] },
            reviews: { imported: 0, errors: [] },
            users: { imported: 0, errors: [] },
            blockedDates: { imported: 0, errors: [] }
        };

        // Import bookings
        if (bookings && Array.isArray(bookings)) {
            for (const booking of bookings) {
                try {
                    await sql`
                        INSERT INTO bookings (
                            id, dj_user, client_name, event_type, date, time, location,
                            contact_email, contact_phone, notes, total_revenue, cc_payment, payout
                        ) VALUES (
                            ${booking.id}, ${booking.djUser || booking.dj_user},
                            ${booking.clientName || booking.client_name || null},
                            ${booking.eventType || booking.event_type || null},
                            ${booking.date}, ${booking.time || null}, ${booking.location || null},
                            ${booking.contactEmail || booking.contact_email || null},
                            ${booking.contactPhone || booking.contact_phone || null},
                            ${booking.notes || null},
                            ${booking.totalRevenue || booking.total_revenue || null},
                            ${booking.ccPayment || booking.cc_payment || null},
                            ${booking.payout || null}
                        ) ON CONFLICT (id) DO NOTHING
                    `;
                    results.bookings.imported++;
                } catch (error) {
                    results.bookings.errors.push({ id: booking.id, error: error.message });
                }
            }
        }

        // Import reviews
        if (reviews && Array.isArray(reviews)) {
            for (const review of reviews) {
                try {
                    await sql`
                        INSERT INTO reviews (
                            id, dj_username, client_name, rating, comment, event_name, event_date
                        ) VALUES (
                            ${review.id || null},
                            ${review.djUsername || review.dj_username},
                            ${review.clientName || review.client_name || null},
                            ${review.rating || null},
                            ${review.comment || null},
                            ${review.eventName || review.event_name || null},
                            ${review.eventDate || review.event_date || null}
                        ) ON CONFLICT (id) DO NOTHING
                    `;
                    results.reviews.imported++;
                } catch (error) {
                    results.reviews.errors.push({ id: review.id, error: error.message });
                }
            }
        }

        // Import users
        if (users && Array.isArray(users)) {
            for (const user of users) {
                try {
                    await sql`
                        INSERT INTO users (
                            username, email, password, first_name, last_name, phone,
                            user_type, is_super_user, profile_picture
                        ) VALUES (
                            ${user.username}, ${user.email}, ${user.password || 'temp123'},
                            ${user.firstName || user.first_name || null},
                            ${user.lastName || user.last_name || null},
                            ${user.phone || null},
                            ${user.userType || user.user_type || (user.isSuperUser ? 'admin' : 'dj')},
                            ${user.isSuperUser || user.is_super_user || false},
                            ${user.profilePicture || user.profile_picture || null}
                        ) ON CONFLICT (username) DO UPDATE SET
                            email = EXCLUDED.email,
                            first_name = EXCLUDED.first_name,
                            last_name = EXCLUDED.last_name,
                            phone = EXCLUDED.phone,
                            updated_at = CURRENT_TIMESTAMP
                    `;
                    results.users.imported++;
                } catch (error) {
                    results.users.errors.push({ username: user.username, error: error.message });
                }
            }
        }

        // Import blocked dates
        if (blockedDates && Array.isArray(blockedDates)) {
            for (const blockedDate of blockedDates) {
                try {
                    await sql`
                        INSERT INTO blocked_dates (dj_user, date, reason, blocked_by)
                        VALUES (
                            ${blockedDate.djUser || blockedDate.dj_user},
                            ${blockedDate.date},
                            ${blockedDate.reason || null},
                            ${blockedDate.blockedBy || blockedDate.blocked_by || blockedDate.djUser || blockedDate.dj_user}
                        ) ON CONFLICT (dj_user, date) DO NOTHING
                    `;
                    results.blockedDates.imported++;
                } catch (error) {
                    results.blockedDates.errors.push({ date: blockedDate.date, error: error.message });
                }
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Migration completed',
            results
        });

    } catch (error) {
        console.error('Migration error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

