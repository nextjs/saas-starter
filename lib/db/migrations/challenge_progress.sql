-- Create challenges progress table
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_completed_day INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS challenge_progress_user_challenge_idx ON challenge_progress(user_id, challenge_id); 