-- Remove all problematic views first
DROP VIEW IF EXISTS public.public_profiles_view CASCADE;
DROP VIEW IF EXISTS public.public_profiles CASCADE;
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Now create a clean view
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM profiles
WHERE profile_visibility = 'public';

-- Grant permissions
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO anon;