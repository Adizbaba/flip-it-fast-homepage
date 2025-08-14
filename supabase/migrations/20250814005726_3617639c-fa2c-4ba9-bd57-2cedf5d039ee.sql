-- Fix security definer views by recreating them with security invoker
DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.profiles_secure;

-- Create public_profiles view with security invoker (uses querying user's permissions)
CREATE VIEW public.public_profiles WITH (security_invoker=true) AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  profile_visibility
FROM public.profiles
WHERE profile_visibility = 'public';

-- Create profiles_secure view with security invoker (uses querying user's permissions)  
CREATE VIEW public.profiles_secure WITH (security_invoker=true) AS
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
FROM public.profiles
WHERE auth.uid() = id;