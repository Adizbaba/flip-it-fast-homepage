-- Create a secure public profiles view that only exposes safe fields
-- Use a different name to avoid conflicts
CREATE OR REPLACE VIEW public.safe_public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles
WHERE profile_visibility = 'public';

-- Grant appropriate permissions
GRANT SELECT ON public.safe_public_profiles TO authenticated;
GRANT SELECT ON public.safe_public_profiles TO anon;