-- Add is_recruitment column to matches table
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_recruitment BOOLEAN DEFAULT false;
