/**
 * API Endpoint: Confirm Password Reset
 * POST /api/dj-reset-password-confirm
 * 
 * Validates token and updates user password
 */

import crypto from 'crypto';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { token, newPassword } = req.body;

        // Validation
        if (!token || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Token and new password are required' 
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 8 characters long' 
            });
        }

        // Validate token and get associated email
        const resetRequest = await getResetTokenData(token);

        if (!resetRequest) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid or expired reset token' 
            });
        }

        // Check if token is expired
        if (resetRequest.expiresAt < Date.now()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reset token has expired' 
            });
        }

        // Check if token has already been used
        if (resetRequest.used) {
            return res.status(400).json({ 
                success: false, 
                message: 'This reset link has already been used' 
            });
        }

        // Hash the new password (in production, use bcrypt or similar)
        // For now, we'll store it as-is (replace with proper hashing)
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password in database
        await updateUserPassword(resetRequest.email, hashedPassword);

        // Mark token as used
        await markTokenAsUsed(token);

        return res.status(200).json({ 
            success: true, 
            message: 'Password has been reset successfully' 
        });

    } catch (error) {
        console.error('Password reset confirmation error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'An error occurred while resetting your password' 
        });
    }
}

/**
 * Get reset token data from database
 */
async function getResetTokenData(token) {
    // Example: Using Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // const result = await sql`SELECT * FROM password_resets WHERE token = ${token}`;
    // if (result.rows.length === 0) return null;
    // const row = result.rows[0];
    // return {
    //     email: row.email,
    //     expiresAt: new Date(row.expires_at).getTime(),
    //     used: row.used
    // };

    // Example: Using MongoDB Atlas
    // const { MongoClient } = await import('mongodb');
    // const client = new MongoClient(process.env.DATABASE_URL);
    // await client.connect();
    // const db = client.db();
    // const resetRequest = await db.collection('password_resets').findOne({ token });
    // await client.close();
    // if (!resetRequest) return null;
    // return {
    //     email: resetRequest.email,
    //     expiresAt: new Date(resetRequest.expiresAt).getTime(),
    //     used: resetRequest.used || false
    // };

    // For development: Return mock data (replace with actual database query)
    return {
        email: 'user@example.com',
        expiresAt: Date.now() + 3600000, // 1 hour from now
        used: false
    };
}

/**
 * Hash password (use bcrypt in production)
 */
async function hashPassword(password) {
    // In production, use bcrypt:
    // const bcrypt = (await import('bcrypt')).default;
    // return bcrypt.hashSync(password, 10);
    
    // For development, just return the password (NOT SECURE - replace with bcrypt)
    return password;
}

/**
 * Update user password in database
 */
async function updateUserPassword(email, hashedPassword) {
    // Example: Using Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // await sql`UPDATE dj_users SET password = ${hashedPassword}, updated_at = NOW() WHERE email = ${email}`;

    // Example: Using MongoDB Atlas
    // const { MongoClient } = await import('mongodb');
    // const client = new MongoClient(process.env.DATABASE_URL);
    // await client.connect();
    // const db = client.db();
    // await db.collection('dj_users').updateOne(
    //     { email },
    //     { $set: { password: hashedPassword, updatedAt: new Date() } }
    // );
    // await client.close();

    // For development: Log update (replace with actual database update)
    console.log(`Updating password for ${email}`);
}

/**
 * Mark reset token as used
 */
async function markTokenAsUsed(token) {
    // Example: Using Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // await sql`UPDATE password_resets SET used = true WHERE token = ${token}`;

    // Example: Using MongoDB Atlas
    // const { MongoClient } = await import('mongodb');
    // const client = new MongoClient(process.env.DATABASE_URL);
    // await client.connect();
    // const db = client.db();
    // await db.collection('password_resets').updateOne(
    //     { token },
    //     { $set: { used: true } }
    // );
    // await client.close();

    // For development: Log update (replace with actual database update)
    console.log(`Marking token as used: ${token}`);
}

