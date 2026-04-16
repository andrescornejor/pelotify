-- ==========================================
-- ADD DYNAMIC PRICING TO CANCHAS_FIELDS
-- ==========================================

-- 1. Add jsonb column for time-based pricing
ALTER TABLE public.canchas_fields 
ADD COLUMN IF NOT EXISTS time_pricing jsonb DEFAULT '[]';

-- 2. Add comment for documentation
COMMENT ON COLUMN public.canchas_fields.time_pricing 
IS 'Lista de rangos horarios y sus precios: [{"startTime": "08:00", "endTime": "17:00", "price": 12000}]';

-- 3. Policy update (already covered by "Owners can manage fields of their businesses" if using ALL)
-- No additional RLS needed if 'ALL' was used in creation.
