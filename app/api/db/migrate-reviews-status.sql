-- Migration: Add status field to reviews table for approval workflow
-- Run this SQL script in your Vercel Postgres database

-- Add status column if it doesn't exist
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'

-- Add service_type column to distinguish between Photography, Videography, DJ Entertainment
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100); -- 'Photography Services', 'Videography Services', 'DJ Entertainment'

-- Update existing reviews to be approved by default (so they continue to show)
UPDATE reviews SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Create index for status field
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- Create index for service_type field
CREATE INDEX IF NOT EXISTS idx_reviews_service_type ON reviews(service_type);

