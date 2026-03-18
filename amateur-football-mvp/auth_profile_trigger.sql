-- SQL Script to handle automatic profile creation on user signup
-- This is critical for Oauth (Google) users to have a profile record immediately.

-- 1. Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    avatar_url, 
    position, 
    age, 
    height, 
    preferred_foot
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'position', 'DC'),
    COALESCE((new.raw_user_meta_data->>'age')::int, 23),
    COALESCE((new.raw_user_meta_data->>'height')::int, 175),
    COALESCE(new.raw_user_meta_data->>'preferred_foot', new.raw_user_meta_data->>'preferredFoot', 'Derecha')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Also ensure stats are initialized if they aren't already handled by defaults
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger (it will call the function above)
-- We drop it first to avoid duplicates if re-running the script
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Notify that the trigger is ready
-- This ensures that Google users get a profile record IMMEDIATELY in the public schema.
