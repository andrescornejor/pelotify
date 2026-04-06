-- SQL Migration to add pro subscription fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pro_since timestamp with time zone,
ADD COLUMN IF NOT EXISTS pro_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text;
