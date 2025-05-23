-- Add missing columns to tables

-- 1. Add metadata column to activity_logs if it doesn't exist
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2. Add lesson_id column to lesson_ratings if it doesn't exist
ALTER TABLE public.lesson_ratings ADD COLUMN IF NOT EXISTS lesson_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- 3. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_lesson_ratings_lesson_id ON public.lesson_ratings(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_ratings_user_id ON public.lesson_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata ON public.activity_logs USING GIN (metadata jsonb_path_ops); 