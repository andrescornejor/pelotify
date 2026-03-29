-- Add venue linking to matches to improve reliability
ALTER TABLE public.matches
ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES public.canchas_fields(id),
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.canchas_businesses(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_field_id ON public.matches(field_id);
CREATE INDEX IF NOT EXISTS idx_matches_business_id ON public.matches(business_id);
