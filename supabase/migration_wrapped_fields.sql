-- ============================================================
-- Migration: Add Wrapped fields to reviews
-- Run in Supabase SQL Editor
-- ============================================================

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS emotional_impact integer
    CHECK (emotional_impact between 1 and 5),
  ADD COLUMN IF NOT EXISTS would_reread boolean,
  ADD COLUMN IF NOT EXISTS pace text
    CHECK (pace IN ('too_slow', 'just_right', 'too_fast')),
  ADD COLUMN IF NOT EXISTS one_word text
    CHECK (char_length(one_word) <= 30);
