-- Database Migration Script for Personal Organizer
-- Run this in your Supabase SQL Editor
-- This script is safe to run multiple times - it only adds columns if they don't exist

-- Create the user_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  wardrobe_categories JSONB,
  wardrobe_data JSONB,
  wardrobe_wishlist JSONB,
  wardrobe_brand_urls JSONB,
  wardrobe_wishlist_urls JSONB,
  wardrobe_image_urls JSONB,
  -- Fit cards: saved outfit combinations (over, top, bottom, shoes, notes)
  fit_cards JSONB,
  grooming_data JSONB,
  blueprint_data JSONB,
  daily_reflection JSONB,
  weekly_tracker JSONB,
  weight_data JSONB,
  food_data JSONB,
  -- Media data stores: consumed media, toConsume queue, and weeklyRecaps
  media_data JSONB,
  todo_notes JSONB,
  -- Network data stores: contacts list and weekly planner
  network_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);

-- Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DROP POLICY IF EXISTS "Allow all operations" ON user_data;
CREATE POLICY "Allow all operations" ON user_data FOR ALL USING (true);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add food_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'food_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN food_data JSONB;
        RAISE NOTICE 'Added food_data column';
    END IF;

    -- Add weight_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'weight_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN weight_data JSONB;
        RAISE NOTICE 'Added weight_data column';
    END IF;

    -- Add weekly_tracker column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'weekly_tracker'
    ) THEN
        ALTER TABLE user_data ADD COLUMN weekly_tracker JSONB;
        RAISE NOTICE 'Added weekly_tracker column';
    END IF;

    -- Add daily_reflection column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'daily_reflection'
    ) THEN
        ALTER TABLE user_data ADD COLUMN daily_reflection JSONB;
        RAISE NOTICE 'Added daily_reflection column';
    END IF;

    -- Add todo_notes column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'todo_notes'
    ) THEN
        ALTER TABLE user_data ADD COLUMN todo_notes JSONB;
        RAISE NOTICE 'Added todo_notes column';
    END IF;

    -- Add network_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'network_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN network_data JSONB;
        RAISE NOTICE 'Added network_data column';
    END IF;

    -- Add media_data column if missing
    -- This stores: consumed media, toConsume queue, and weeklyRecaps
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'media_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN media_data JSONB;
        RAISE NOTICE 'Added media_data column (includes consumed, toConsume, weeklyRecaps)';
    END IF;

    -- Add wardrobe_image_urls column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'wardrobe_image_urls'
    ) THEN
        ALTER TABLE user_data ADD COLUMN wardrobe_image_urls JSONB;
        RAISE NOTICE 'Added wardrobe_image_urls column';
    END IF;

    -- Add blueprint_data column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'blueprint_data'
    ) THEN
        ALTER TABLE user_data ADD COLUMN blueprint_data JSONB;
        RAISE NOTICE 'Added blueprint_data column';
    END IF;

    -- Add fit_cards column if missing
    -- Stores saved outfit combinations: over, top, bottom, shoes, notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_data' AND column_name = 'fit_cards'
    ) THEN
        ALTER TABLE user_data ADD COLUMN fit_cards JSONB;
        RAISE NOTICE 'Added fit_cards column';
    END IF;

    RAISE NOTICE 'Migration complete - all columns verified/added';
END $$;

-- Verify the table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_data'
ORDER BY ordinal_position;
