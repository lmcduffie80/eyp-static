// API endpoint for users (DJs and Admins)
// GET /api/users - Get all users (optionally filtered by type)
// POST /api/users - Create new user
// PUT /api/users - Update user

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
            // Get all users
            const { user_type } = req.query; // Optional filter by type (dj/admin)
            
            let query = sql`SELECT * FROM users ORDER BY created_at DESC`;
            if (user_type) {
                query = sql`SELECT * FROM users WHERE user_type = ${user_type} ORDER BY created_at DESC`;
            }
            
            const result = await query;
            
            return res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    username: row.username,
                    email: row.email,
                    firstName: row.first_name,
                    lastName: row.last_name,
                    phone: row.phone,
                    userType: row.user_type,
                    isSuperUser: row.is_super_user,
                    profilePicture: row.profile_picture,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                }))
            });

        } else if (req.method === 'POST') {
            // Create new user
            const {
                username,
                email,
                password,
                firstName,
                lastName,
                phone,
                userType,
                isSuperUser,
                profilePicture
            } = req.body;

            // Validation
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: username, email, password'
                });
            }

            // Check if username or email already exists
            const existing = await sql`
                SELECT id FROM users WHERE username = ${username} OR email = ${email}
            `;
            if (existing.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    error: 'Username or email already exists'
                });
            }

            const result = await sql`
                INSERT INTO users (
                    username, email, password, first_name, last_name, phone,
                    user_type, is_super_user, profile_picture
                ) VALUES (
                    ${username}, ${email}, ${password}, ${firstName || null}, ${lastName || null},
                    ${phone || null}, ${userType || 'dj'}, ${isSuperUser || false}, ${profilePicture || null}
                ) RETURNING *
            `;

            const user = result.rows[0];
            return res.status(201).json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    userType: user.user_type,
                    isSuperUser: user.is_super_user,
                    profilePicture: user.profile_picture,
                    createdAt: user.created_at
                }
            });

        } else if (req.method === 'PUT') {
            // Update user
            const {
                id,
                username,
                email,
                password,
                firstName,
                lastName,
                phone,
                profilePicture
            } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            // Update user - use COALESCE to only update provided fields
            const result = await sql`
                UPDATE users SET
                    username = COALESCE(${username || null}, username),
                    email = COALESCE(${email || null}, email),
                    password = COALESCE(${password || null}, password),
                    first_name = COALESCE(${firstName !== undefined ? firstName : null}, first_name),
                    last_name = COALESCE(${lastName !== undefined ? lastName : null}, last_name),
                    phone = COALESCE(${phone !== undefined ? phone : null}, phone),
                    profile_picture = COALESCE(${profilePicture !== undefined ? profilePicture : null}, profile_picture),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${id}
                RETURNING *
            `;

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const user = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone: user.phone,
                    userType: user.user_type,
                    isSuperUser: user.is_super_user,
                    profilePicture: user.profile_picture,
                    updatedAt: user.updated_at
                }
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Users API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

