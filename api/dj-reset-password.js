/**
 * API Endpoint: Request Password Reset
 * POST /api/dj-reset-password
 * 
 * Sends a password reset email to the user
 */

import crypto from 'crypto';
import sql from './db/connection.js';
import { setSecurityHeaders, setCORSHeaders } from './security-headers.js';

// For Vercel, use environment variables
// Set these in your Vercel project settings:
// - SENDGRID_API_KEY (or GMAIL_USER and GMAIL_APP_PASSWORD)
// - EMAIL_FROM
// - BASE_URL

export default async function handler(req, res) {
    // Set security headers
    setSecurityHeaders(res);
    
    // Set CORS headers with specific origins
    setCORSHeaders(req, res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
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
        const user = await checkUserExists(email);
        
        // Always process (don't reveal if email exists for security)
        if (user) {
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
 */
async function checkUserExists(email) {
    try {
        // Check if user exists in users table (DJ users)
        const result = await sql`
            SELECT id, email, username, first_name, last_name 
            FROM users 
            WHERE email = ${email.toLowerCase().trim()} AND user_type = 'dj'
        `;
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return null;
    }
}

/**
 * Store reset token in database
 */
async function storeResetToken(email, token, expiry) {
    try {
        // Convert expiry timestamp to Date object
        const expiryDate = new Date(expiry);
        
        // Try to insert, and if email already exists, update it
        // First, try to delete any existing tokens for this email
        await sql`DELETE FROM password_resets WHERE email = ${email.toLowerCase().trim()}`;
        
        // Insert new reset token
        await sql`
            INSERT INTO password_resets (email, token, expires_at, created_at, used)
            VALUES (${email.toLowerCase().trim()}, ${token}, ${expiryDate}, NOW(), false)
        `;
        
        console.log(`Reset token stored for ${email}`);
    } catch (error) {
        // If table doesn't exist, create it first (for development/testing)
        if (error.message && error.message.includes('does not exist')) {
            console.warn('password_resets table does not exist, attempting to create it...');
            try {
                // Create password_resets table if it doesn't exist
                await sql`
                    CREATE TABLE IF NOT EXISTS password_resets (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL,
                        token VARCHAR(255) NOT NULL UNIQUE,
                        expires_at TIMESTAMP NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW(),
                        used BOOLEAN DEFAULT false
                    )
                `;
                
                // Create index on email for faster lookups
                await sql`
                    CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)
                `;
                
                // Now try inserting again
                const expiryDate = new Date(expiry);
                await sql`DELETE FROM password_resets WHERE email = ${email.toLowerCase().trim()}`;
                await sql`
                    INSERT INTO password_resets (email, token, expires_at, created_at, used)
                    VALUES (${email.toLowerCase().trim()}, ${token}, ${expiryDate}, NOW(), false)
                `;
                
                console.log(`Reset token stored for ${email} (table created)`);
            } catch (createError) {
                console.error('Error creating password_resets table:', createError);
                throw createError;
            }
        } else {
            console.error('Error storing reset token:', error);
            throw error;
        }
    }
}

/**
 * Send password reset email using Gmail SMTP, SendGrid, or AWS SES
 */
async function sendResetEmail(email, resetLink) {
    // Email content template
    const emailContent = {
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

    // Option 1: Using Gmail SMTP (via Nodemailer) - CHECK THIS FIRST
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        const nodemailer = (await import('nodemailer')).default;
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
            }
        });

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };

        await transporter.sendMail(msg);
        return;
    }

    // Option 2: Using SendGrid
    if (process.env.SENDGRID_API_KEY) {
        const sgMail = (await import('@sendgrid/mail')).default;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || 'noreply@eyp-static.vercel.app',
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html
        };

        await sgMail.send(msg);
        return;
    }
    if (process.env.SENDGRID_API_KEY) {
        const sgMail = (await import('@sendgrid/mail')).default;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email,
            from: process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@eyp-static.vercel.app',
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

    // Option 3: Using AWS SES (if configured)
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

