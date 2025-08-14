-- Fix security vulnerability: Restrict access to sensitive profile data
-- Update RLS policy on profiles table to protect sensitive information

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can read public profiles" ON public.profiles;

-- Create more restrictive policies
-- Users can only view their own complete profile data
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create a separate policy for public profile data (non-sensitive fields only)
-- This will be handled through a view instead for better security

-- Create a secure public profiles view that only exposes non-sensitive data
CREATE OR REPLACE VIEW public.public_profile_display AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  created_at,
  updated_at
FROM public.profiles
WHERE profile_visibility = 'public';

-- Set security invoker on the view
ALTER VIEW public.public_profile_display SET (security_invoker=true);

-- Enable RLS on the view
CREATE POLICY "Anyone can view public profile display"
ON public.public_profile_display
FOR SELECT
TO authenticated, anon
USING (true);

-- Update the existing public_profiles view to be more secure
DROP VIEW IF EXISTS public.public_profiles;
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  full_name,
  avatar_url,
  profile_visibility
FROM public.profiles
WHERE profile_visibility = 'public' OR auth.uid() = id;

-- Set security invoker on the updated view
ALTER VIEW public.public_profiles SET (security_invoker=true);