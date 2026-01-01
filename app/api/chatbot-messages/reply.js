// API endpoint for admin replies to chatbot messages
// POST /api/chatbot-messages/reply - Create admin reply to a conversation

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
        if (req.method === 'POST') {
            // Create admin reply to a conversation
            const {
                conversationId,
                message,
                adminName
            } = req.body;

            // Validation
            if (!conversationId || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: conversationId, message'
                });
            }

            // Insert admin reply message
            const result = await sql`
                INSERT INTO chatbot_messages (
                    conversation_id, sender_name, message, is_admin_reply, status
                ) VALUES (
                    ${conversationId},
                    ${adminName || 'Admin'},
                    ${message},
                    true,
                    'replied'
                )
                RETURNING *
            `;

            // Update original message status to 'replied' if it exists
            await sql`
                UPDATE chatbot_messages 
                SET status = 'replied', updated_at = CURRENT_TIMESTAMP
                WHERE conversation_id = ${conversationId} AND is_admin_reply = false AND status != 'replied'
            `;

            return res.status(201).json({
                success: true,
                data: {
                    id: result.rows[0].id,
                    conversationId: result.rows[0].conversation_id,
                    senderName: result.rows[0].sender_name,
                    senderEmail: result.rows[0].sender_email,
                    senderPhone: result.rows[0].sender_phone,
                    message: result.rows[0].message,
                    isAdminReply: result.rows[0].is_admin_reply,
                    status: result.rows[0].status,
                    createdAt: result.rows[0].created_at,
                    updatedAt: result.rows[0].updated_at
                }
            });

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
    } catch (error) {
        console.error('Error in chatbot-messages reply API:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

