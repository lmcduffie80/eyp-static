// Migration script to add status and service_type columns to reviews table
// This can be run directly via Node.js or imported and executed

import sql from './connection.js';

export default async function migrateReviews() {
    try {
        console.log('Starting reviews table migration...');
        
        // First, verify the reviews table exists
        try {
            const tableCheck = await sql`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'reviews'
                ) as table_exists
            `;
            
            if (!tableCheck.rows[0]?.table_exists) {
                throw new Error('Reviews table does not exist. Please create it first using schema.sql');
            }
        } catch (tableError) {
            console.error('Error checking for reviews table:', tableError);
            throw new Error(`Cannot verify reviews table exists: ${tableError.message}`);
        }
        
        // Check if columns already exist before adding (case-insensitive check)
        let existingColumns = [];
        try {
            const checkColumns = await sql`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'reviews' 
                AND column_name IN ('status', 'service_type', 'updated_at')
            `;
            existingColumns = checkColumns.rows.map(row => row.column_name.toLowerCase());
        } catch (checkError) {
            console.warn('Could not check existing columns, proceeding with migration:', checkError.message);
        }
        
        const results = [];
        
        // Add status column if it doesn't exist
        if (!existingColumns.includes('status')) {
            try {
                await sql`
                    ALTER TABLE reviews 
                    ADD COLUMN status VARCHAR(50) DEFAULT 'pending'
                `;
                results.push('Added status column');
                console.log('✓ Added status column');
            } catch (addError) {
                // Check if column was added by another process
                if (addError.message && !addError.message.includes('already exists') && !addError.code === '42701') {
                    throw new Error(`Failed to add status column: ${addError.message}`);
                }
                results.push('status column already exists');
                console.log('✓ status column already exists');
            }
        } else {
            results.push('status column already exists');
            console.log('✓ status column already exists');
        }
        
        // Add service_type column if it doesn't exist
        if (!existingColumns.includes('service_type')) {
            try {
                await sql`
                    ALTER TABLE reviews 
                    ADD COLUMN service_type VARCHAR(100)
                `;
                results.push('Added service_type column');
                console.log('✓ Added service_type column');
            } catch (addError) {
                if (addError.message && !addError.message.includes('already exists') && !addError.code === '42701') {
                    throw new Error(`Failed to add service_type column: ${addError.message}`);
                }
                results.push('service_type column already exists');
                console.log('✓ service_type column already exists');
            }
        } else {
            results.push('service_type column already exists');
            console.log('✓ service_type column already exists');
        }
        
        // Add updated_at column if it doesn't exist
        if (!existingColumns.includes('updated_at')) {
            try {
                await sql`
                    ALTER TABLE reviews 
                    ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                `;
                results.push('Added updated_at column');
                console.log('✓ Added updated_at column');
            } catch (addError) {
                if (addError.message && !addError.message.includes('already exists') && !addError.code === '42701') {
                    throw new Error(`Failed to add updated_at column: ${addError.message}`);
                }
                results.push('updated_at column already exists');
                console.log('✓ updated_at column already exists');
            }
        } else {
            results.push('updated_at column already exists');
            console.log('✓ updated_at column already exists');
        }
        
        // Make dj_username nullable (it should be optional for non-DJ reviews)
        try {
            // Check if column exists and if it's nullable
            const columnInfo = await sql`
                SELECT column_name, is_nullable
                FROM information_schema.columns
                WHERE table_name = 'reviews' 
                    AND column_name = 'dj_username'
            `;
            
            if (columnInfo.rows.length > 0) {
                const isNullable = columnInfo.rows[0].is_nullable === 'YES';
                
                if (!isNullable) {
                    // Column exists but is NOT NULL - make it nullable
                    try {
                        await sql`
                            ALTER TABLE reviews 
                            ALTER COLUMN dj_username DROP NOT NULL
                        `;
                        results.push('Made dj_username column nullable');
                        console.log('✓ Made dj_username column nullable');
                    } catch (dropError) {
                        // If DROP NOT NULL fails, try recreating the column
                        console.log('DROP NOT NULL failed, trying to alter column type...');
                        await sql`
                            ALTER TABLE reviews 
                            ALTER COLUMN dj_username TYPE VARCHAR(255)
                        `;
                        await sql`
                            ALTER TABLE reviews 
                            ALTER COLUMN dj_username DROP NOT NULL
                        `;
                        results.push('Made dj_username column nullable');
                        console.log('✓ Made dj_username column nullable');
                    }
                } else {
                    results.push('dj_username column is already nullable');
                    console.log('✓ dj_username column is already nullable');
                }
            } else {
                console.log('Note: dj_username column does not exist');
            }
        } catch (alterError) {
            console.log('Note: Could not alter dj_username column:', alterError.message);
            // Don't throw - continue with migration
        }
        
        // Update existing reviews to be approved by default
        try {
            const updateResult = await sql`
                UPDATE reviews SET status = 'approved' WHERE status IS NULL
            `;
            if (updateResult.rowCount > 0) {
                results.push(`Updated ${updateResult.rowCount} existing reviews to approved status`);
                console.log(`✓ Updated ${updateResult.rowCount} existing reviews to approved status`);
            }
        } catch (updateError) {
            // This is not critical, just log it
            console.log('Note: Could not update existing reviews:', updateError.message);
        }
        
        // Create indexes
        try {
            await sql`
                CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status)
            `;
            results.push('Created/verified index on status');
            console.log('✓ Created/verified index on status');
        } catch (indexError) {
            console.log('Note: Index on status:', indexError.message);
        }
        
        try {
            await sql`
                CREATE INDEX IF NOT EXISTS idx_reviews_service_type ON reviews(service_type)
            `;
            results.push('Created/verified index on service_type');
            console.log('✓ Created/verified index on service_type');
        } catch (indexError) {
            console.log('Note: Index on service_type:', indexError.message);
        }
        
        console.log('Migration completed successfully!');
        return { 
            success: true, 
            message: 'Migration completed successfully',
            details: results
        };
    } catch (error) {
        console.error('Migration error:', error);
        const errorMessage = error.message || 'Unknown error';
        const errorDetails = {
            message: errorMessage,
            code: error.code,
            detail: error.detail,
            hint: error.hint
        };
        throw new Error(`Migration failed: ${errorMessage}. Details: ${JSON.stringify(errorDetails)}`);
    }
}


