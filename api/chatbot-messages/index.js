// API endpoint for chatbot messages
// GET /api/chatbot-messages - Get all messages/conversations
// POST /api/chatbot-messages - Create new message from chatbot

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
            // Get all messages, grouped by conversation_id
            const { conversation_id, status } = req.query;
            
            let query;
            if (conversation_id) {
                // Get messages for a specific conversation
                query = sql`SELECT * FROM chatbot_messages WHERE conversation_id = ${conversation_id} ORDER BY created_at ASC`;
            } else {
                // Get all conversations (latest message from each conversation)
                // Use a subquery to get the latest message ID for each conversation, then join
                if (status) {
                    query = sql`
                        SELECT m.* FROM chatbot_messages m
                        INNER JOIN (
                            SELECT conversation_id, MAX(created_at) as max_created_at
                            FROM chatbot_messages
                            WHERE status = ${status}
                            GROUP BY conversation_id
                        ) latest ON m.conversation_id = latest.conversation_id 
                            AND m.created_at = latest.max_created_at
                        WHERE m.status = ${status}
                        ORDER BY m.created_at DESC
                    `;
                } else {
                    query = sql`
                        SELECT m.* FROM chatbot_messages m
                        INNER JOIN (
                            SELECT conversation_id, MAX(created_at) as max_created_at
                            FROM chatbot_messages
                            GROUP BY conversation_id
                        ) latest ON m.conversation_id = latest.conversation_id 
                            AND m.created_at = latest.max_created_at
                        ORDER BY m.created_at DESC
                    `;
                }
            }
            
            const result = await query;
            
            return res.status(200).json({
                success: true,
                data: result.rows.map(row => ({
                    id: row.id,
                    conversationId: row.conversation_id,
                    senderName: row.sender_name,
                    senderEmail: row.sender_email,
                    senderPhone: row.sender_phone,
                    message: row.message,
                    isAdminReply: row.is_admin_reply,
                    status: row.status,
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                }))
            });

        } else if (req.method === 'POST') {
            // Create new message from chatbot
            const {
                conversationId,
                senderName,
                senderEmail,
                senderPhone,
                message
            } = req.body;

            // Validation
            if (!message || !conversationId) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required fields: conversationId, message'
                });
            }

            // Create or get conversation ID
            let finalConversationId = conversationId;
            if (!finalConversationId || finalConversationId === 'new') {
                finalConversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            }

            // Insert message
            const result = await sql`
                INSERT INTO chatbot_messages (
                    conversation_id, sender_name, sender_email, sender_phone, 
                    message, is_admin_reply, status
                ) VALUES (
                    ${finalConversationId},
                    ${senderName || null},
                    ${senderEmail || null},
                    ${senderPhone || null},
                    ${message},
                    false,
                    'pending'
                )
                RETURNING *
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
        console.error('Error in chatbot-messages API:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

