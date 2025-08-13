-- 1) Create a minimal public view that never exposes sensitive contact data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  profile_visibility
FROM public.profiles;

-- 2) Create a secure view that masks sensitive fields unless the requester owns the row
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT
  id,
  created_at,
  updated_at,
  username,
  full_name,
  avatar_url,
  profile_visibility,
  CASE WHEN auth.uid() = id THEN contact_number ELSE NULL END AS contact_number,
  CASE WHEN auth.uid() = id THEN shipping_address ELSE NULL END AS shipping_address
FROM public.profiles;

-- 3) Ensure views are readable
GRANT SELECT ON public.public_profiles TO anon, authenticated;
GRANT SELECT ON public.profiles_secure TO anon, authenticated;

-- 4) Prevent direct table reads that can leak sensitive columns
REVOKE SELECT ON TABLE public.profiles FROM anon, authenticated;

-- Keep existing INSERT/UPDATE policies as-is, so users can still manage their own profiles safely