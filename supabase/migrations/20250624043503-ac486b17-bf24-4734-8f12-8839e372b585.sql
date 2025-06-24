
-- First, let's see what seller_ids exist in auction_items but not in profiles
-- and either create missing profiles or remove orphaned auction items

-- Option 1: Create missing profiles for existing auction items
INSERT INTO public.profiles (id, username, full_name)
SELECT DISTINCT ai.seller_id, 
       COALESCE(au.email, 'user_' || SUBSTRING(ai.seller_id::text, 1, 8)) as username,
       COALESCE(au.raw_user_meta_data ->> 'full_name', 'User') as full_name
FROM public.auction_items ai
LEFT JOIN auth.users au ON ai.seller_id = au.id
WHERE ai.seller_id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Now add the foreign key constraint
ALTER TABLE public.auction_items 
ADD CONSTRAINT fk_auction_items_seller_id 
FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
