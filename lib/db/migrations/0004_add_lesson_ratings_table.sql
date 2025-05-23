-- Add lesson_ratings table
CREATE TABLE IF NOT EXISTS public.lesson_ratings (
  id SERIAL PRIMARY KEY,
  user_id integer NOT NULL REFERENCES public.users(id),
  user_name varchar(255) NOT NULL,
  ip_address varchar(45) NOT NULL,
  lesson_id integer NOT NULL,
  rating integer NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Add an index on lesson_id and user_id for faster lookup
CREATE INDEX IF NOT EXISTS idx_lesson_ratings_lesson_id ON public.lesson_ratings(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_ratings_user_id ON public.lesson_ratings(user_id); 