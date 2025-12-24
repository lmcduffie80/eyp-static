// Database initialization helper
// This file contains helper functions for database operations

import { sql } from '@vercel/postgres';

/**
 * Initialize database tables
 * Run this once to create all tables
 */
export async function initializeDatabase() {
    try {
        // Read schema file and execute
        // Note: In production, you'd want to run the schema.sql file directly via Vercel dashboard
        // or use a migration tool. This is just a helper function.
        
        console.log('Database initialization should be done via Vercel dashboard SQL editor');
        console.log('Or run the schema.sql file directly');
        
        return { success: true, message: 'Please run schema.sql via Vercel dashboard' };
    } catch (error) {
        console.error('Database initialization error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const result = await sql`SELECT NOW() as current_time`;
        return { success: true, data: result.rows[0] };
    } catch (error) {
        console.error('Database connection error:', error);
        return { success: false, error: error.message };
    }
}

