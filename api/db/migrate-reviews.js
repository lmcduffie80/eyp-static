// Migration script to add status and service_type columns to reviews table
// This can be run directly via Node.js or imported and executed

import sql from './connection.js';

export default async function migrateReviews() {
    try {
        console.log('Starting reviews table migration...');
        
        // Check if columns already exist before adding
        const checkColumns = await sql`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'reviews' 
            AND column_name IN ('status', 'service_type', 'updated_at')
        `;
        
        const existingColumns = checkColumns.rows.map(row => row.column_name);
        
        // Add status column if it doesn't exist
        if (!existingColumns.includes('status')) {
            await sql`
                ALTER TABLE reviews 
                ADD COLUMN status VARCHAR(50) DEFAULT 'pending'
            `;
            console.log('✓ Added status column');
        } else {
            console.log('✓ status column already exists');
        }
        
        // Add service_type column if it doesn't exist
        if (!existingColumns.includes('service_type')) {
            await sql`
                ALTER TABLE reviews 
                ADD COLUMN service_type VARCHAR(100)
            `;
            console.log('✓ Added service_type column');
        } else {
            console.log('✓ service_type column already exists');
        }
        
        // Add updated_at column if it doesn't exist
        if (!existingColumns.includes('updated_at')) {
            await sql`
                ALTER TABLE reviews 
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `;
            console.log('✓ Added updated_at column');
        } else {
            console.log('✓ updated_at column already exists');
        }
        
        // Update existing reviews to be approved by default (so they continue to show)
        // Only update if status column was just added or if there are reviews with NULL status
        try {
            await sql`
                UPDATE reviews SET status = 'approved' WHERE status IS NULL
            `;
            console.log('✓ Updated existing reviews to approved status');
        } catch (updateError) {
            console.log('Note: Could not update existing reviews (may not be needed)');
        }
        
        // Create indexes (using IF NOT EXISTS - supported in PostgreSQL 9.5+)
        try {
            await sql`
                CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)
            `;
            console.log('✓ Created/verified index on status');
        } catch (indexError) {
            // Index might already exist, which is fine
            console.log('Note: Index on status may already exist');
        }
        
        try {
            await sql`
                CREATE INDEX IF NOT EXISTS idx_reviews_service_type ON reviews(service_type)
            `;
            console.log('✓ Created/verified index on service_type');
        } catch (indexError) {
            // Index might already exist, which is fine
            console.log('Note: Index on service_type may already exist');
        }
        
        console.log('Migration completed successfully!');
        return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
        console.error('Migration error:', error);
        throw error;
    }
}


