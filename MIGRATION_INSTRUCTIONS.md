# Reviews Migration Instructions

The review system requires additional columns in the `reviews` table. Follow these steps to run the migration:

## Option 1: Run SQL Directly in Vercel Dashboard (Recommended)

1. Go to your **Vercel Dashboard**
2. Navigate to your project → **Storage** → **Postgres**
3. Click on **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Add status column if it doesn't exist
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Add service_type column to distinguish between Photography, Videography, DJ Entertainment
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);

-- Add updated_at column if it doesn't exist
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing reviews to be approved by default (so they continue to show)
UPDATE reviews SET status = 'approved' WHERE status IS NULL;

-- Create index for status field
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create index for service_type field
CREATE INDEX IF NOT EXISTS idx_reviews_service_type ON reviews(service_type);
```

5. Click **Run** or **Execute**
6. You should see a success message
7. Try submitting a review again on your website

## Option 2: Run via API Endpoint

After deploying your changes, visit this URL in your browser:
```
https://your-domain.vercel.app/api/migrate-reviews
```

You should see a JSON response like:
```json
{
  "success": true,
  "message": "Migration completed successfully"
}
```

## What This Migration Does

- Adds `status` column (pending/approved/rejected) - defaults to 'pending'
- Adds `service_type` column (Photography Services/Videography Services/DJ Entertainment)
- Adds `updated_at` column for tracking updates
- Updates any existing reviews to 'approved' status
- Creates indexes for better query performance

## Verification

After running the migration, you can verify it worked by checking if the columns exist:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reviews';
```

You should see `status`, `service_type`, and `updated_at` in the results.

