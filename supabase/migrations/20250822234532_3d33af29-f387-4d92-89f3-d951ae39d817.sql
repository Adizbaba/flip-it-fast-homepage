-- Create a secure public profiles view that only exposes non-sensitive fields
CREATE OR REPLACE VIEW public.public_profiles_view AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  profile_visibility,
  created_at,
  updated_at
FROM public.profiles
WHERE profile_visibility = 'public';

-- Create a secure function to get profile data based on visibility
CREATE OR REPLACE FUNCTION public.get_safe_profile(profile_id uuid)
RETURNS TABLE (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  contact_number text,
  shipping_address text,
  profile_visibility text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If requesting own profile or user is authenticated and profile owner, return full data
  IF auth.uid() = profile_id THEN
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      p.contact_number,
      p.shipping_address,
      p.profile_visibility,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    WHERE p.id = profile_id;
  ELSE
    -- For public profiles, only return safe fields (no contact info)
    RETURN QUERY
    SELECT 
      p.id,
      p.username,
      p.full_name,
      p.avatar_url,
      NULL::text as contact_number,
      NULL::text as shipping_address,
      p.profile_visibility,
      p.created_at,
      p.updated_at
    FROM public.profiles p
    WHERE p.id = profile_id 
    AND p.profile_visibility = 'public';
  END IF;
END;
$$;

-- Update the profiles table RLS policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can read public profiles" ON public.profiles;

-- New restrictive policy: users can only see full profile data for their own profiles
CREATE POLICY "Users can only read their own full profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a separate policy for public profile viewing (limited fields only)
-- This will be handled through the public_profiles_view or get_safe_profile function

-- Enable RLS on the view (though views inherit from underlying tables)
-- Grant access to the public view
GRANT SELECT ON public.public_profiles_view TO authenticated;
GRANT SELECT ON public.public_profiles_view TO anon;

-- Grant execute permissions on the safe profile function
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_safe_profile(uuid) TO anon;