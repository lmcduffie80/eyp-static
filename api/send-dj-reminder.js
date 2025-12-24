/**
 * API Endpoint: Send DJ Reminder SMS
 * POST /api/send-dj-reminder
 * 
 * Sends SMS reminders to DJs about their upcoming bookings
 */

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
        const { djId, djName, djPhone, bookings } = req.body;

        // Validate required fields
        if (!djPhone) {
            return res.status(400).json({ 
                success: false, 
                message: 'DJ phone number is required' 
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

        // Build SMS message
        let message = `Hi ${djName || 'DJ'}, you have ${bookings.length} upcoming booking${bookings.length > 1 ? 's' : ''}:\n\n`;
        
        bookings.slice(0, 5).forEach((booking, index) => {
            const date = formatDate(booking.date);
            message += `${index + 1}. ${booking.eventType || 'Event'} on ${date}`;
            if (booking.location) {
                message += ` at ${booking.location}`;
            }
            message += '\n';
        });

        if (bookings.length > 5) {
            message += `\n...and ${bookings.length - 5} more booking${bookings.length - 5 > 1 ? 's' : ''}`;
        }

        message += '\n- Externally Yours Productions';

        // Send SMS using Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return res.status(500).json({ 
                success: false, 
                message: 'SMS service not configured. Please set Twilio environment variables.' 
            });
        }

        // Normalize phone number (remove any non-digits, add +1 for US numbers if needed)
        let phoneNumber = djPhone.replace(/\D/g, ''); // Remove non-digits
        if (phoneNumber.length === 10) {
            phoneNumber = '+1' + phoneNumber; // Add US country code
        } else if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
        }

        // Import Twilio client (you'll need to install twilio package)
        // For now, we'll use fetch to call Twilio API
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        
        const formData = new URLSearchParams({
            From: fromNumber,
            To: phoneNumber,
            Body: message
        });

        const twilioResponse = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        const twilioData = await twilioResponse.json();

        if (!twilioResponse.ok) {
            console.error('Twilio error:', twilioData);
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send SMS: ' + (twilioData.message || 'Unknown error'),
                error: twilioData 
            });
        }

        return res.status(200).json({
            success: true,
            message: `SMS reminder sent successfully to ${djName}`,
            sid: twilioData.sid
        });

    } catch (error) {
        console.error('Send DJ reminder error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

