-- ==========================================
-- PELOTIFY - CANCHAS REVIEWS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.canchas_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.canchas_businesses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- RLS for canchas_reviews
ALTER TABLE public.canchas_reviews ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can view reviews
CREATE POLICY "Public reviews are viewable by everyone"
  ON public.canchas_reviews FOR SELECT
  USING (true);

-- 2. Authenticated users can post reviews
CREATE POLICY "Users can post their own reviews"
  ON public.canchas_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update/delete their own reviews
CREATE POLICY "Users can update their own reviews"
  ON public.canchas_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.canchas_reviews FOR DELETE
  USING (auth.uid() = user_id);
