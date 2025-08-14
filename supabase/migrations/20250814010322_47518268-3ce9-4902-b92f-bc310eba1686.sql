-- Enable RLS on the profiles_secure view and add proper policies
ALTER VIEW public.profiles_secure SET (security_invoker=true);
ALTER TABLE public.profiles_secure ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for profiles_secure view - users can only access their own data
CREATE POLICY "Users can access their own secure profile data"
ON public.profiles_secure
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Also ensure public_profiles view has RLS enabled for consistency
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for public_profiles view - anyone can read public profiles
CREATE POLICY "Anyone can read public profiles"
ON public.public_profiles
FOR SELECT
TO authenticated, anon
USING (true);