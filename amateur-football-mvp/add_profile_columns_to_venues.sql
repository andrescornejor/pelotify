-- Add profile_image_url and description to canchas_businesses if they don't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='canchas_businesses' AND column_name='profile_image_url') THEN
      ALTER TABLE public.canchas_businesses ADD COLUMN profile_image_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='canchas_businesses' AND column_name='description') THEN
      ALTER TABLE public.canchas_businesses ADD COLUMN description text;
  END IF;
END $$;
