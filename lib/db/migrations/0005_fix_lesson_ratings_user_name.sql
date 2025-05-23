-- Fix user_name null violations in lesson_ratings
-- 1. Drop NOT NULL constraint temporarily for backfill
ALTER TABLE public.lesson_ratings ALTER COLUMN user_name DROP NOT NULL;

-- 2. Backfill existing rows with user email
UPDATE public.lesson_ratings lr
SET user_name = u.email
FROM public.users u
WHERE lr.user_id = u.id AND lr.user_name IS NULL;

-- 3. Reinstate NOT NULL constraint
ALTER TABLE public.lesson_ratings ALTER COLUMN user_name SET NOT NULL; 