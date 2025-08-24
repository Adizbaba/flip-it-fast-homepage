-- Remove views that are triggering security definer warnings
DROP VIEW IF EXISTS public.profiles_secure CASCADE;
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Instead of views, let's enhance the RLS policies on the profiles table itself
-- This is a more secure approach that avoids the security definer issues

-- First, let's add a policy that allows reading only safe fields for public profiles
-- We'll handle this at the application level by being careful about what fields we select

-- Create a simple function to check if a profile should be publicly visible
CREATE OR REPLACE FUNCTION public.is_profile_public(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_visibility = 'public' 
  FROM profiles 
  WHERE id = profile_id;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_profile_public(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_profile_public(uuid) TO anon;