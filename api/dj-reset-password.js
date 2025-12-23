/**
 * API Endpoint: Request Password Reset
 * POST /api/dj-reset-password
 * 
 * Sends a password reset email to the user
 */

import crypto from 'crypto';

// For Vercel, use environment variables
// Set these in your Vercel project settings:
// - SENDGRID_API_KEY
// - EMAIL_FROM
// - BASE_URL
// - DATABASE_URL (or use Vercel Postgres, MongoDB Atlas, etc.)

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { email } = req.body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email address' 
            });
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Check if user exists and store reset token
        // Replace this with your actual database query
        const userExists = await checkUserExists(email);
        
        // Always process (don't reveal if email exists for security)
        if (userExists) {
            // Store reset token in database
            await storeResetToken(email, resetToken, resetTokenExpiry);

            // Send email with reset link
            const resetLink = `${process.env.BASE_URL || 'https://eyp-static.vercel.app'}/dj-reset-password.html?token=${resetToken}`;
            await sendResetEmail(email, resetLink);
        }

        // Always return success (security best practice)
        return res.status(200).json({ 
            success: true, 
            message: 'If an account exists with that email, a password reset link has been sent.' 
        });

    } catch (error) {
        console.error('Password reset error:', error);
        // Still return success to avoid revealing if email exists
        return res.status(200).json({ 
            success: true, 
            message: 'If an account exists with that email, a password reset link has been sent.' 
        });
    }
}

/**
 * Check if user exists in database
 * Replace with your actual database query
 */
async function checkUserExists(email) {
    // Example: Using Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // const result = await sql`SELECT * FROM dj_users WHERE email = ${email}`;
    // return result.rows.length > 0;

    // Example: Using MongoDB Atlas
    // const { MongoClient } = await import('mongodb');
    // const client = new MongoClient(process.env.DATABASE_URL);
    // await client.connect();
    // const db = client.db();
    // const user = await db.collection('dj_users').findOne({ email });
    // await client.close();
    // return !!user;

    // For development: Check localStorage equivalent or return true
    // In production, replace with actual database query
    return true; // Placeholder
}

/**
 * Store reset token in database
 */
async function storeResetToken(email, token, expiry) {
    // Example: Using Vercel Postgres
    // const { sql } = await import('@vercel/postgres');
    // await sql`
    //     INSERT INTO password_resets (email, token, expires_at, created_at)
    //     VALUES (${email}, ${token}, to_timestamp(${expiry/1000}), NOW())
    //     ON CONFLICT (email) DO UPDATE 
    //     SET token = ${token}, expires_at = to_timestamp(${expiry/1000}), created_at = NOW()
    // `;

    // Example: Using MongoDB Atlas
    // const { MongoClient } = await import('mongodb');
    // const client = new MongoClient(process.env.DATABASE_URL);
    // await client.connect();
    // const db = client.db();
    // await db.collection('password_resets').updateOne(
    //     { email },
    //     { 
    //         $set: { 
    //             email,
    //             token,
    //             expiresAt: new Date(expiry),
    //             createdAt: new Date(),
    //             used: false
    //         }
    //     },
    //     { upsert: true }
    // );
    // await client.close();

    // For development: Store in database
    // In production, replace with actual database storage
    console.log(`Storing reset token for ${email}`);
}

/**
 * Send password reset email using SendGrid
 */
async function sendResetEmail(email, resetLink) {
    // Option 1: Using SendGrid (Recommended)
    if (process.env.SENDGRID_API_KEY) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'noreply@eyp-static.vercel.app',
            subject: 'DJ Portal - Password Reset Request',
            text: `
                DJ Portal Password Reset
                
                You requested to reset your password. Click the link below to reset your password:
                
                ${resetLink}
                
                This link will expire in 1 hour.
                
                If you did not request this password reset, please ignore this email.
                
                Externally Yours Productions, LLC
            `,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                        .link { word-break: break-all; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>DJ Portal Password Reset</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>You requested to reset your password for the DJ Portal. Click the button below to reset your password:</p>
                            <p style="text-align: center;">
                                <a href="${resetLink}" class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p class="link">${resetLink}</p>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                            <p>If you did not request this password reset, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>Externally Yours Productions, LLC</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await sgMail.send(msg);
        return;
    }

    // Option 2: Using AWS SES (if configured)
    if (process.env.AWS_SES_REGION) {
        const AWS = (await import('aws-sdk')).default;
        const ses = new AWS.SES({ region: process.env.AWS_SES_REGION });

        const params = {
            Destination: { ToAddresses: [email] },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `...` // Same HTML as above
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: `...` // Same text as above
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: 'DJ Portal - Password Reset Request'
                }
            },
            Source: process.env.EMAIL_FROM || 'noreply@eyp-static.vercel.app'
        };

        await ses.sendEmail(params).promise();
        return;
    }

    // Fallback: Log to console (for development)
    console.log('=== Password Reset Email ===');
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('===========================');
    
    throw new Error('No email service configured. Please set up SendGrid or AWS SES.');
}

