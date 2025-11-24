-- Add policy to allow public read access to basic profile information
-- This is needed for displaying seller usernames in auction listings
CREATE POLICY "Allow public read access to basic profile info"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the overly restrictive policy that only allows users to see their own profiles
DROP POLICY IF EXISTS "Users can only read their own full profiles" ON public.profiles;