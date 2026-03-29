-- ==========================================
-- PELOTIFY - CANCHAS (VENUE DASHBOARD) DASHBOARD SCHEMA
-- ==========================================

-- 1. Table: canchas_businesses
-- Represents the establishment (Olimpicus, Adiur, etc)
CREATE TABLE IF NOT EXISTS public.canchas_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  address text,
  city text,
  phone text,
  mp_access_token text, -- Mercado Pago Access Token for split payments
  mp_public_key text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for canchas_businesses
ALTER TABLE public.canchas_businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their own business"
  ON public.canchas_businesses FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view active businesses"
  ON public.canchas_businesses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Owners can update their own business"
  ON public.canchas_businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their own business"
  ON public.canchas_businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);


-- 2. Table: canchas_fields
-- Represents individual fields within the establishment (Cancha 1, Cancha 2, etc)
CREATE TABLE IF NOT EXISTS public.canchas_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.canchas_businesses(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL, -- F5, F7, F11
  price_per_match numeric NOT NULL DEFAULT 0,
  down_payment_percentage numeric NOT NULL DEFAULT 30, -- Seña
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS for canchas_fields
ALTER TABLE public.canchas_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage fields of their businesses"
  ON public.canchas_fields FOR ALL
  USING (
    business_id IN (
      SELECT id FROM public.canchas_businesses WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view fields to book"
  ON public.canchas_fields FOR SELECT
  USING (is_active = true);


-- 3. Table: canchas_bookings
-- Represents the reservations
CREATE TABLE IF NOT EXISTS public.canchas_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid REFERENCES public.canchas_fields(id) ON DELETE CASCADE NOT NULL,
  booker_id uuid REFERENCES auth.users(id), -- User who booked (can be null if booked manually by owner)
  title text, -- Auto-generated or manual name
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  total_price numeric NOT NULL DEFAULT 0,
  down_payment_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- pending, partial_paid, full_paid, cancelled
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for canchas_bookings
ALTER TABLE public.canchas_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage bookings of their fields"
  ON public.canchas_bookings FOR ALL
  USING (
    field_id IN (
      SELECT id FROM public.canchas_fields WHERE business_id IN (
        SELECT id FROM public.canchas_businesses WHERE owner_id = auth.uid()
      )
    )
  );

-- Users can view and create their own bookings
CREATE POLICY "Users can view their own bookings"
  ON public.canchas_bookings FOR SELECT
  USING (booker_id = auth.uid());

CREATE POLICY "Users can create bookings"
  ON public.canchas_bookings FOR INSERT
  WITH CHECK (booker_id = auth.uid());


-- Profiles table update
-- We add 'role' to profiles if it's not there to distinguish 'player' vs 'venue_admin'
-- NOTE: Depending on DB state, this might already exist.
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
      ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'player';
  END IF;
END $$;
