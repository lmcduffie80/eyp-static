// TEMPORARY endpoint to run database schema
// ⚠️ DELETE THIS FILE AFTER RUNNING THE SCHEMA ONCE FOR SECURITY
// GET /api/run-schema - Runs the schema.sql file

import sql from './db/connection.js';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        // Schema SQL statements
        const statements = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                phone VARCHAR(50),
                user_type VARCHAR(20) NOT NULL DEFAULT 'dj',
                is_super_user BOOLEAN DEFAULT FALSE,
                profile_picture TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Bookings table
            `CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                dj_user VARCHAR(255) NOT NULL,
                client_name VARCHAR(255),
                event_type VARCHAR(255),
                date DATE NOT NULL,
                time VARCHAR(100),
                location TEXT,
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                notes TEXT,
                total_revenue DECIMAL(10, 2),
                cc_payment DECIMAL(10, 2),
                payout DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Reviews table
            `CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                dj_username VARCHAR(255) NOT NULL,
                client_name VARCHAR(255),
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                event_name VARCHAR(255),
                event_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Blocked dates table
            `CREATE TABLE IF NOT EXISTS blocked_dates (
                id SERIAL PRIMARY KEY,
                dj_user VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                reason TEXT,
                blocked_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(dj_user, date)
            )`,
            
            // Analytics table
            `CREATE TABLE IF NOT EXISTS analytics_visits (
                id SERIAL PRIMARY KEY,
                visitor_id VARCHAR(255),
                session_id VARCHAR(255),
                page VARCHAR(255),
                referrer TEXT,
                user_agent TEXT,
                device_type VARCHAR(50),
                referrer_source VARCHAR(255),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            
            // Indexes
            `CREATE INDEX IF NOT EXISTS idx_bookings_dj_user ON bookings(dj_user)`,
            `CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date)`,
            `CREATE INDEX IF NOT EXISTS idx_reviews_dj_username ON reviews(dj_username)`,
            `CREATE INDEX IF NOT EXISTS idx_blocked_dates_dj_user ON blocked_dates(dj_user)`,
            `CREATE INDEX IF NOT EXISTS idx_blocked_dates_date ON blocked_dates(date)`,
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
            `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`
        ];

        const results = [];
        const errors = [];

        // Get pool for raw SQL execution
        const pool = await getPool();

        for (const statement of statements) {
            try {
                if (pool) {
                    await pool.query(statement);
                } else {
                    // Fallback: try with sql helper (won't work for CREATE, but worth trying)
                    // Actually, we need raw SQL execution, so pool is required
                    throw new Error('Database pool not available');
                }
                results.push({ success: true, statement: statement.substring(0, 60) + '...' });
            } catch (error) {
                // Some errors are OK (like "already exists")
                if (error.message.includes('already exists') || 
                    error.message.includes('duplicate') ||
                    error.message.includes('relation') && error.message.includes('already')) {
                    results.push({ success: true, statement: statement.substring(0, 60) + '...', note: 'already exists' });
                } else {
                    errors.push({ statement: statement.substring(0, 60) + '...', error: error.message });
                    console.error('Schema execution error:', error);
                }
            }
        }

        // Verify tables were created
        let createdTables = [];
        try {
            const tablesResult = await pool.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            `);
            createdTables = tablesResult.rows.map(r => r.table_name);
        } catch (error) {
            console.error('Error checking tables:', error);
        }

        // Close pool
        if (pool) {
            await pool.end();
        }

        return res.status(200).json({
            success: true,
            message: 'Schema execution completed',
            results: {
                statementsExecuted: statements.length,
                successful: results.filter(r => r.success).length,
                errors: errors.length,
                createdTables: createdTables
            },
            errors: errors.length > 0 ? errors : undefined,
            expectedTables: ['users', 'bookings', 'reviews', 'blocked_dates', 'analytics_visits'],
            actualTables: createdTables
        });

    } catch (error) {
        console.error('Schema execution error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to execute schema',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// Helper to get pool for raw SQL queries
async function getPool() {
    const useVercelPostgres = !!process.env.POSTGRES_URL;
    const useAWSSigner = !!(
        process.env.AWS_ROLE_ARN &&
        process.env.PGHOST &&
        process.env.PGUSER
    );

    if (useVercelPostgres) {
        // For Vercel Postgres, we'd need to get the underlying connection
        // For now, we'll use AWS RDS approach
        return null;
    }

    if (useAWSSigner) {
        try {
            const { Signer } = await import("@aws-sdk/rds-signer");
            const { awsCredentialsProvider } = await import("@vercel/oidc-aws-credentials-provider");
            const { Pool } = await import("pg");

            const signer = new Signer({
                hostname: process.env.PGHOST,
                port: Number(process.env.PGPORT || 5432),
                username: process.env.PGUSER,
                region: process.env.AWS_REGION || "us-east-1",
                credentials: awsCredentialsProvider({
                    roleArn: process.env.AWS_ROLE_ARN,
                    clientConfig: { region: process.env.AWS_REGION || "us-east-1" },
                }),
            });

            const authToken = await signer.getAuthToken();
            
            return new Pool({
                host: process.env.PGHOST,
                user: process.env.PGUSER,
                database: process.env.PGDATABASE || "postgres",
                password: authToken,
                port: Number(process.env.PGPORT || 5432),
                ssl: { rejectUnauthorized: false },
                max: 1,
            });
        } catch (error) {
            console.error('Failed to create pool:', error);
            return null;
        }
    }

    return null;
}
