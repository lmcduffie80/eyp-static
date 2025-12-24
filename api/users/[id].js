// API endpoint for individual user operations
// GET /api/users/[id] - Get single user
// PUT /api/users/[id] - Update user  
// DELETE /api/users/[id] - Delete user

import sql from '../db/connection.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    try {
        if (req.method === 'GET') {
            // Get single user
            const result = await sql`SELECT * FROM users WHERE id = ${id}`;
            
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
                    createdAt: user.created_at,
                    updatedAt: user.updated_at
                }
            });

        } else if (req.method === 'PUT') {
            // Update user
            const {
                username,
                email,
                password,
                firstName,
                lastName,
                phone,
                profilePicture
            } = req.body;

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

        } else if (req.method === 'DELETE') {
            // Delete user
            // First check if user exists and is not a super user
            const existing = await sql`SELECT is_super_user FROM users WHERE id = ${id}`;
            
            if (existing.rows.length === 0) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            if (existing.rows[0].is_super_user) {
                return res.status(403).json({ success: false, error: 'Cannot delete super user' });
            }

            const result = await sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
            
            return res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });

        } else {
            return res.status(405).json({ success: false, error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('User API error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

