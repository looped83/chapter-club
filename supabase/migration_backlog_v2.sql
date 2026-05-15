-- ============================================================
-- Migration: Backlog V2
-- Chapter Club – Persistenter Reading Backlog
--
-- Run in Supabase SQL Editor BEFORE deploying frontend changes.
-- This migration is safe to run on an existing database.
-- ============================================================

-- 1. Add status column (active / selected / archived)
--    Default 'active' so all existing suggestions stay active.
ALTER TABLE book_suggestions
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CONSTRAINT book_suggestions_status_check
    CHECK (status IN ('active', 'selected', 'archived'));

-- 2. Add updated_at column
ALTER TABLE book_suggestions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Trigger to auto-update updated_at (set_updated_at() already exists from schema.sql)
DROP TRIGGER IF EXISTS book_suggestions_updated_at ON book_suggestions;
CREATE TRIGGER book_suggestions_updated_at
  BEFORE UPDATE ON book_suggestions
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 3. Drop the one-suggestion-per-person-per-month constraint.
--    Books are now persistent and users may add multiple books.
ALTER TABLE book_suggestions
  DROP CONSTRAINT IF EXISTS book_suggestions_suggested_by_target_month_target_year_key;

-- 4. Make target_month / target_year nullable.
--    New backlog books are not tied to a specific target month.
--    Existing rows keep their values (historical data).
ALTER TABLE book_suggestions
  ALTER COLUMN target_month DROP NOT NULL,
  ALTER COLUMN target_year  DROP NOT NULL;

-- Also drop the CHECK constraints that require these to be non-null
-- (PostgreSQL keeps CHECK even after DROP NOT NULL, so we re-add without it)
ALTER TABLE book_suggestions
  DROP CONSTRAINT IF EXISTS book_suggestions_target_month_check,
  DROP CONSTRAINT IF EXISTS book_suggestions_target_year_check;

ALTER TABLE book_suggestions
  ADD CONSTRAINT book_suggestions_target_month_check
    CHECK (target_month IS NULL OR target_month BETWEEN 1 AND 12),
  ADD CONSTRAINT book_suggestions_target_year_check
    CHECK (target_year IS NULL OR target_year > 2000);

-- ============================================================
-- 5. Update RLS Policies for book_suggestions
-- ============================================================

-- Drop old policies that will be replaced
DROP POLICY IF EXISTS "Users can update own suggestion"       ON book_suggestions;
DROP POLICY IF EXISTS "Users can update own active suggestion" ON book_suggestions;
DROP POLICY IF EXISTS "Users can delete own suggestion"        ON book_suggestions;
DROP POLICY IF EXISTS "Users can delete own active suggestion" ON book_suggestions;

-- Update own active books only
-- (selected / archived books are immutable for normal users)
CREATE POLICY "Users can update own active suggestion"
  ON book_suggestions FOR UPDATE
  TO authenticated
  USING  (auth.uid() = suggested_by AND status = 'active')
  WITH CHECK (auth.uid() = suggested_by);

-- Delete own active books only
-- (archiving via UPDATE to status='archived' is preferred; hard-delete also allowed)
CREATE POLICY "Users can delete own active suggestion"
  ON book_suggestions FOR DELETE
  TO authenticated
  USING (auth.uid() = suggested_by AND status = 'active');

-- ============================================================
-- NOTE: "Only vote for active books" constraint
-- ============================================================
-- Supabase RLS cannot perform cross-table lookups in simple policies.
-- This rule is enforced defensively in the frontend:
--   - Vote buttons are hidden for non-active books in the UI
--   - The castVote query function skips votes for archived/selected books
-- See src/features/backlog/queries.ts for the frontend guard.
-- ============================================================

-- ============================================================
-- After running this migration:
-- 1. Deploy the updated frontend
-- 2. To mark a winning book as "selected" (after voting ends):
--    UPDATE book_suggestions SET status = 'selected' WHERE id = '<winner-uuid>';
--    Then insert into books table if you want it as the monthly book.
-- ============================================================
