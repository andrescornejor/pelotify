-- Add location fields and description to canchas_businesses
ALTER TABLE public.canchas_businesses 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric,
ADD COLUMN IF NOT EXISTS google_maps_link text,
ADD COLUMN IF NOT EXISTS description text;
