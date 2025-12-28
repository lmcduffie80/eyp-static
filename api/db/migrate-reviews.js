// Migration script to add status and service_type columns to reviews table
// This can be run directly via Node.js or imported and executed

import sql from './connection.js';

export default async function migrateReviews() {
    try {
        console.log('Starting reviews table migration...');
        
        // Add status column if it doesn't exist
        await sql`
            ALTER TABLE reviews 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'
        `;
        console.log('✓ Added status column');
        
        // Add service_type column if it doesn't exist
        await sql`
            ALTER TABLE reviews 
            ADD COLUMN IF NOT EXISTS service_type VARCHAR(100)
        `;
        console.log('✓ Added service_type column');
        
        // Add updated_at column if it doesn't exist (for consistency)
        await sql`
            ALTER TABLE reviews 
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `;
        console.log('✓ Added updated_at column');
        
        // Update existing reviews to be approved by default (so they continue to show)
        await sql`
            UPDATE reviews SET status = 'approved' WHERE status IS NULL OR status = 'pending'
        `;
        console.log('✓ Updated existing reviews to approved status');
        
        // Create indexes
        await sql`
            CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)
        `;
        console.log('✓ Created index on status');
        
        await sql`
            CREATE INDEX IF NOT EXISTS idx_reviews_service_type ON reviews(service_type)
        `;
        console.log('✓ Created index on service_type');
        
        console.log('Migration completed successfully!');
        return { success: true, message: 'Migration completed successfully' };
    } catch (error) {
        console.error('Migration error:', error);
        // Check if columns already exist (error code 42701 for duplicate column)
        if (error.code === '42701' || error.message.includes('already exists')) {
            console.log('Columns may already exist. Migration may have already been run.');
            return { success: true, message: 'Migration may have already been completed' };
        }
        throw error;
    }
}


