-- Remove the problematic views that have security definer issues
DROP VIEW IF EXISTS public.public_profiles_view CASCADE;
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Create a clean, simple view for safe public profiles without security definer
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