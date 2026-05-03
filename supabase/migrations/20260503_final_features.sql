-- Final Features Migration: Premium Listings, Amenities, and Reviews
-- Run this in Supabase SQL Editor

-- 1. Add Premium & Amenity columns to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

-- 2. Create Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS for Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. Review Policies
-- Allow anyone to read reviews
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access for reviews') THEN
        CREATE POLICY "Allow public read access for reviews" ON reviews FOR SELECT USING (true);
    END IF;
END $$;

-- Allow authenticated users to insert their own reviews
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to insert their own reviews') THEN
        CREATE POLICY "Allow users to insert their own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON reviews(property_id);
