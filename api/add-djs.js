// API endpoint to add Lee McDuffie and Misty McDuffie as DJ users
// GET /api/add-djs - Adds the DJs to the system

import sql from './db/connection.js';
import { hashPassword } from './utils/password.js';
import { setSecurityHeaders, setCORSHeaders } from './security-headers.js';

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers
    setCORSHeaders(req, res);

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        console.log('Adding DJ users...');
        
        // Default password for new DJs (should be changed after first login)
        const defaultPassword = 'TempPassword123!';
        const hashedPassword = await hashPassword(defaultPassword);
        
        const djsToAdd = [
            {
                username: 'lee',
                email: 'lee.mcduffie@externallyyoursproductions.com', // Update with actual email if different
                firstName: 'Lee',
                lastName: 'McDuffie',
                phone: null, // Add phone number if available
                userType: 'dj'
            },
            {
                username: 'misty',
                email: 'mistymcduffie@yahoo.com',
                firstName: 'Misty',
                lastName: 'McDuffie',
                phone: null, // Add phone number if available
                userType: 'dj'
            }
        ];
        
        const results = [];
        
        for (const dj of djsToAdd) {
            // Check if user already exists
            const existing = await sql`
                SELECT id FROM users WHERE username = ${dj.username} OR email = ${dj.email}
            `;
            
            if (existing.rows.length > 0) {
                results.push({
                    dj: `${dj.firstName} ${dj.lastName}`,
                    status: 'exists',
                    message: `DJ ${dj.firstName} ${dj.lastName} (${dj.username}) already exists`
                });
                continue;
            }
            
            // Insert the DJ user
            const result = await sql`
                INSERT INTO users (
                    username, email, password, first_name, last_name, phone,
                    user_type, is_super_user, profile_picture
                ) VALUES (
                    ${dj.username}, ${dj.email}, ${hashedPassword}, ${dj.firstName}, ${dj.lastName},
                    ${dj.phone}, ${dj.userType}, false, null
                ) RETURNING id, username, first_name, last_name, email
            `;
            
            const newUser = result.rows[0];
            results.push({
                dj: `${newUser.first_name} ${newUser.last_name}`,
                status: 'created',
                message: `Successfully added DJ: ${newUser.first_name} ${newUser.last_name} (${newUser.username})`,
                username: newUser.username,
                email: newUser.email,
                defaultPassword: defaultPassword
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'DJ import completed',
            results: results,
            note: 'Default password for new DJs: TempPassword123! (Please change after first login)'
        });
        
    } catch (error) {
        console.error('Error adding DJs:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

