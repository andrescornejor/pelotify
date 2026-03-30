-- ==========================================
-- PELOTIFY - FIX CANCHAS BOOKINGS RLS
-- ==========================================

-- Currently, the RLS policy only allows users to view their OWN bookings.
-- This prevents other accounts from seeing that a time slot is occupied!
-- We need a policy to allow ANY authenticated user to SELECT from canchas_bookings
-- so they can see which times are already taken.

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.canchas_bookings;

CREATE POLICY "Anyone can view bookings to check availability"
  ON public.canchas_bookings FOR SELECT
  USING (true);

-- This ensures that when someone tries to create a match, they can see 
-- all occupied times regardless of who made the reservation.
