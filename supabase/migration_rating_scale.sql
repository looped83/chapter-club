-- Migration: Change rating scale from 1-10 (integer) to 0-5 (numeric, 0.5 steps)
-- Run in Supabase SQL Editor

-- Scale any existing ratings proportionally (e.g. 7 → 3.5)
UPDATE reviews SET rating = ROUND((rating / 2.0) * 2) / 2;

-- Drop old constraint
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

-- Change column type to numeric
ALTER TABLE reviews
  ALTER COLUMN rating TYPE numeric(3,1) USING rating::numeric(3,1);

-- Add new constraint (0–5, multiples of 0.5)
ALTER TABLE reviews
  ADD CONSTRAINT reviews_rating_check
  CHECK (rating >= 0 AND rating <= 5 AND MOD(rating * 2, 1) = 0);
