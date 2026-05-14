-- Migration: Allow users to delete own reviews
-- Run in Supabase SQL Editor

CREATE POLICY "Users can delete own review"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
