/**
 * API Endpoint: Send DJ Reminder Email
 * POST /api/send-dj-email-reminder
 * 
 * Sends email reminders to DJs about their upcoming bookings
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Allow GET for testing
    if (req.method === 'GET') {
        return res.status(200).json({
            success: true,
            message: 'Send DJ Email Reminder API is running',
            timestamp: new Date().toISOString()
        });
    }

    // Only allow POST requests for actual sending
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method not allowed' 
        });
    }

    try {
        const { djName, djEmail, bookings } = req.body;

        // Validate required fields
        if (!djEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'DJ email address is required' 
            });
        }

        if (!bookings || !Array.isArray(bookings) || bookings.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No upcoming bookings found for this DJ' 
            });
        }

        // Format date for display (MM-DD-YYYY)
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[1]}-${parts[2]}-${parts[0]}`;
            }
            return dateStr;
        };

        // Build email HTML content
        let bookingsListHTML = '';
        bookings.slice(0, 10).forEach((booking, index) => {
            const date = formatDate(booking.date);
            bookingsListHTML += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${index + 1}.</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                        <strong>${booking.eventType || 'Event'}</strong><br>
                        <small style="color: #666;">${date}${booking.location ? ` at ${booking.location}` : ''}</small>
                    </td>
                </tr>
            `;
        });

        if (bookings.length > 10) {
            bookingsListHTML += `
                <tr>
                    <td colspan="2" style="padding: 10px; text-align: center; color: #666;">
                        ...and ${bookings.length - 10} more booking${bookings.length - 10 > 1 ? 's' : ''}
                    </td>
                </tr>
            `;
        }

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
                    .content { background-color: #ffffff; padding: 30px; }
                    .bookings-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .footer { background-color: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Upcoming Bookings Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${djName || 'DJ'},</p>
                        <p>You have <strong>${bookings.length}</strong> upcoming booking${bookings.length > 1 ? 's' : ''}:</p>
                        <table class="bookings-table">
                            ${bookingsListHTML}
                        </table>
                        <p>Please make sure you're prepared for these upcoming events!</p>
                        <p>Best regards,<br>Externally Yours Productions</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated reminder email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Plain text version
        let bookingsListText = '';
        bookings.slice(0, 10).forEach((booking, index) => {
            const date = formatDate(booking.date);
            bookingsListText += `${index + 1}. ${booking.eventType || 'Event'} on ${date}${booking.location ? ` at ${booking.location}` : ''}\n`;
        });
        if (bookings.length > 10) {
            bookingsListText += `\n...and ${bookings.length - 10} more booking${bookings.length - 10 > 1 ? 's' : ''}\n`;
        }

        const emailText = `
Hi ${djName || 'DJ'},

You have ${bookings.length} upcoming booking${bookings.length > 1 ? 's' : ''}:

${bookingsListText}

Please make sure you're prepared for these upcoming events!

Best regards,
Externally Yours Productions

---
This is an automated reminder email. Please do not reply to this message.
        `.trim();

        // Send email using SendGrid
        const sendGridApiKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.FROM_EMAIL || 'noreply@externallyyours.com';

        if (!sendGridApiKey) {
            return res.status(500).json({ 
                success: false, 
                message: 'Email service not configured. Please set SENDGRID_API_KEY environment variable.' 
            });
        }

        // Send email via SendGrid API
        const sendGridUrl = 'https://api.sendgrid.com/v3/mail/send';
        
        const emailData = {
            personalizations: [{
                to: [{ email: djEmail, name: djName }],
                subject: `Upcoming Bookings Reminder - ${bookings.length} Event${bookings.length > 1 ? 's' : ''}`
            }],
            from: {
                email: fromEmail,
                name: 'Externally Yours Productions'
            },
            content: [
                {
                    type: 'text/plain',
                    value: emailText
                },
                {
                    type: 'text/html',
                    value: emailHTML
                }
            ]
        };

        const sendGridResponse = await fetch(sendGridUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sendGridApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!sendGridResponse.ok) {
            const errorText = await sendGridResponse.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                errorData = { message: errorText };
            }
            
            console.error('SendGrid API error:', {
                status: sendGridResponse.status,
                statusText: sendGridResponse.statusText,
                data: errorData
            });
            
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send email: ' + (errorData.errors?.[0]?.message || errorData.message || 'Unknown error'),
                error: errorData,
                status: sendGridResponse.status
            });
        }

        return res.status(200).json({
            success: true,
            message: `Email reminder sent successfully to ${djName}`,
            email: djEmail
        });

    } catch (error) {
        console.error('Send DJ email reminder error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

