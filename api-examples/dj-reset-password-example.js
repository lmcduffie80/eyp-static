/**
 * Example Backend API Endpoint for DJ Password Reset
 * 
 * This is an example implementation for sending password reset emails.
 * You'll need to adapt this to your backend framework (Express.js, AWS Lambda, etc.)
 * 
 * Requirements:
 * - Email service (SendGrid, AWS SES, Nodemailer with SMTP, etc.)
 * - Database to store reset tokens
 * - Environment variables for email service credentials
 */

// Example using Express.js and Nodemailer
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();

// Configure email transporter (example using Gmail SMTP)
// For production, use SendGrid, AWS SES, or another email service
const transporter = nodemailer.createTransporter({
    service: 'gmail', // Or use your SMTP settings
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASSWORD // Your email password or app-specific password
    }
});

// In-memory store for reset tokens (use database in production)
const resetTokens = new Map();

// POST /api/dj-reset-password
router.post('/dj-reset-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email address' 
            });
        }

        // Check if user exists in database
        // Replace with your actual database query
        const user = await db.collection('dj_users').findOne({ email: email });
        
        // Always return success (security best practice - don't reveal if email exists)
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // If user exists, store token and send email
        if (user) {
            // Store reset token in database
            await db.collection('password_resets').insertOne({
                email: email,
                token: resetToken,
                expiresAt: new Date(resetTokenExpiry),
                createdAt: new Date()
            });

            // Create reset link
            const resetLink = `${process.env.BASE_URL}/dj-reset-password?token=${resetToken}`;

            // Send email
            const mailOptions = {
                from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
                to: email,
                subject: 'DJ Portal - Password Reset Request',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
                            .content { padding: 20px; background-color: #f9f9f9; }
                            .button { display: inline-block; padding: 12px 24px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
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
                                <p style="word-break: break-all; color: #666;">${resetLink}</p>
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
                `,
                text: `
                    DJ Portal Password Reset
                    
                    You requested to reset your password. Click the link below to reset your password:
                    
                    ${resetLink}
                    
                    This link will expire in 1 hour.
                    
                    If you did not request this password reset, please ignore this email.
                    
                    Externally Yours Productions, LLC
                `
            };

            await transporter.sendMail(mailOptions);
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
});

module.exports = router;

