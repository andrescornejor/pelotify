-- SQL Migration to add instagram field to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS instagram text;
