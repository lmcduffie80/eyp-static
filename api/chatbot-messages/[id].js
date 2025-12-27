// API endpoint for individual chatbot message operations
// GET /api/chatbot-messages/[id] - Get specific message
// PUT /api/chatbot-messages/[id] - Update message (admin reply)
// DELETE /api/chatbot-messages/[id] - Delete message

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

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'Message ID is required'
        });
    }

    try {
        if (req.method === 'GET') {
            // Get specific message
            const result = await sql`SELECT * FROM chatbot_messages WHERE id = ${id}`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            const row = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
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
                }
            });

        } else if (req.method === 'PUT') {
            // Update message (for admin replies and status changes)
            const {
                message,
                status,
                adminReply
            } = req.body;

            // Validate that at least one field is provided
            if (message === undefined && status === undefined && adminReply === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'At least one field must be provided for update (message, status, or adminReply)'
                });
            }

            // Validate status if provided
            if (status !== undefined && !['pending', 'read', 'replied', 'archived'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Valid status is required: pending, read, replied, or archived'
                });
            }

            // Handle updates based on which fields are provided
            let result;
            try {
                if (status !== undefined && message === undefined && adminReply === undefined) {
                    // Status-only update
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (message !== undefined && status === undefined && adminReply === undefined) {
                    // Message only
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET message = ${message}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (adminReply !== undefined && message === undefined && status === undefined) {
                    // Admin reply flag only
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET is_admin_reply = ${adminReply}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status !== undefined && message !== undefined && adminReply === undefined) {
                    // Status and message
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET status = ${status}, message = ${message}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (status !== undefined && adminReply !== undefined && message === undefined) {
                    // Status and admin reply flag
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET status = ${status}, is_admin_reply = ${adminReply}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else if (message !== undefined && adminReply !== undefined && status === undefined) {
                    // Message and admin reply flag
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET message = ${message}, is_admin_reply = ${adminReply}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                } else {
                    // All fields
                    result = await sql`
                        UPDATE chatbot_messages 
                        SET status = ${status}, message = ${message}, is_admin_reply = ${adminReply}, updated_at = CURRENT_TIMESTAMP
                        WHERE id = ${id}
                        RETURNING *
                    `;
                }
            } catch (updateError) {
                // If updated_at column doesn't exist, try without it
                if (updateError.message && updateError.message.includes('updated_at')) {
                    if (status !== undefined && message === undefined && adminReply === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET status = ${status}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else if (message !== undefined && status === undefined && adminReply === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET message = ${message}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else if (adminReply !== undefined && message === undefined && status === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET is_admin_reply = ${adminReply}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else if (status !== undefined && message !== undefined && adminReply === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET status = ${status}, message = ${message}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else if (status !== undefined && adminReply !== undefined && message === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET status = ${status}, is_admin_reply = ${adminReply}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else if (message !== undefined && adminReply !== undefined && status === undefined) {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET message = ${message}, is_admin_reply = ${adminReply}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    } else {
                        result = await sql`
                            UPDATE chatbot_messages 
                            SET status = ${status}, message = ${message}, is_admin_reply = ${adminReply}
                            WHERE id = ${id}
                            RETURNING *
                        `;
                    }
                } else {
                    throw updateError;
                }
            }
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            const row = result.rows[0];
            return res.status(200).json({
                success: true,
                data: {
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
                }
            });

        } else if (req.method === 'DELETE') {
            // Delete message
            const result = await sql`DELETE FROM chatbot_messages WHERE id = ${id} RETURNING *`;
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Message not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Message deleted successfully'
            });

        } else {
            return res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
    } catch (error) {
        console.error('Error in chatbot-messages [id] API:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
}

