-- Remove latitude and longitude columns as requested
ALTER TABLE public.canchas_businesses 
DROP COLUMN IF EXISTS latitude,
DROP COLUMN IF EXISTS longitude;

-- Also remove them from matches table if they were added there (cleanup)
ALTER TABLE public.matches
DROP COLUMN IF EXISTS lat,
DROP COLUMN IF EXISTS lng;
