-- Add metadata field to activity_logs table
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS metadata JSONB; 