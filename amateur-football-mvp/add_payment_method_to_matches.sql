-- Add payment_method to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'mercado_pago';

-- payment_method can be 'mercado_pago' or 'cash'
COMMENT ON COLUMN public.matches.payment_method IS 'Pre-selected payment method for the match reservation';
