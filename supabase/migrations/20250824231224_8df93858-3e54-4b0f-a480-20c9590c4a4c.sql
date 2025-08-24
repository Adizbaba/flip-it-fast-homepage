-- Check if profiles_secure view is causing the issue and fix it
DROP VIEW IF EXISTS public.profiles_secure CASCADE;

-- Recreate profiles_secure view without SECURITY DEFINER property
CREATE VIEW public.profiles_secure AS
SELECT 
  id,
  created_at,
  updated_at,
  contact_number,
  shipping_address,
  username,
  full_name,
  avatar_url,
  profile_visibility
FROM profiles
WHERE auth.uid() = id;

-- Grant permissions
GRANT SELECT ON public.profiles_secure TO authenticated;