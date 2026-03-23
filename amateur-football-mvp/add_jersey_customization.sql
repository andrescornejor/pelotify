-- Add jersey customization columns to the teams table
ALTER TABLE public.teams 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#18181b',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS jersey_pattern TEXT DEFAULT 'solid';

-- Optional: Update existing teams to have some default values if they were null (though DEFAULT handles it for new and existing if not specified)
-- UPDATE public.teams SET primary_color = '#18181b', secondary_color = '#10b981', jersey_pattern = 'solid' WHERE primary_color IS NULL;
