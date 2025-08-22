-- Remove the security definer view (which was flagged as a security issue)
DROP VIEW IF EXISTS public.public_profiles_view;

-- Update the get_safe_profile function to be more restrictive
-- Remove SECURITY DEFINER and use regular permissions
DROP FUNCTION IF EXISTS public.get_safe_profile(uuid);

-- Create a simple public profiles view without SECURITY DEFINER
-- This view only shows safe, public fields for public profiles
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles
WHERE profile_visibility = 'public';

-- Enable RLS on the view (inherits from profiles table)
ALTER VIEW public.public_profiles SET (security_invoker = true);

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Update grants to remove the old view and function
REVOKE ALL ON public.public_profiles_view FROM authenticated, anon;
REVOKE ALL ON FUNCTION public.get_safe_profile(uuid) FROM authenticated, anon;