-- Add winner tracking and final price fields to auction_items
ALTER TABLE public.auction_items 
ADD COLUMN winner_id uuid REFERENCES auth.users(id),
ADD COLUMN final_selling_price numeric,
ADD COLUMN ended_at timestamp with time zone,
ADD COLUMN reserve_met boolean DEFAULT null;

-- Create auction_events table for audit trail
CREATE TABLE public.auction_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_item_id uuid NOT NULL REFERENCES public.auction_items(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  user_id uuid,
  event_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on auction_events
ALTER TABLE public.auction_events ENABLE ROW LEVEL SECURITY;

-- Create policies for auction_events
CREATE POLICY "Anyone can view auction events" 
ON public.auction_events 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert auction events" 
ON public.auction_events 
FOR INSERT 
WITH CHECK (true);

-- Create function to end auction
CREATE OR REPLACE FUNCTION public.end_auction(auction_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  auction_record RECORD;
  highest_bid_record RECORD;
  result jsonb;
BEGIN
  -- Get auction details with lock
  SELECT * INTO auction_record 
  FROM public.auction_items 
  WHERE id = auction_id 
  AND status = 'Active'
  AND end_date <= now()
  FOR UPDATE;
  
  IF auction_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Auction not found or already ended');
  END IF;
  
  -- Get highest bid
  SELECT b.*, p.username INTO highest_bid_record
  FROM public.bids b
  LEFT JOIN public.profiles p ON b.bidder_id = p.id
  WHERE b.auction_item_id = auction_id
  ORDER BY b.bid_amount DESC, b.created_at ASC
  LIMIT 1;
  
  -- Determine if reserve price is met
  DECLARE
    reserve_met_status boolean := true;
    winner_id_final uuid := null;
    final_price numeric := auction_record.starting_bid;
  BEGIN
    IF highest_bid_record IS NOT NULL THEN
      final_price := highest_bid_record.bid_amount;
      
      -- Check reserve price
      IF auction_record.reserve_price IS NOT NULL THEN
        reserve_met_status := highest_bid_record.bid_amount >= auction_record.reserve_price;
      END IF;
      
      -- Set winner only if reserve is met
      IF reserve_met_status THEN
        winner_id_final := highest_bid_record.bidder_id;
      END IF;
    ELSE
      -- No bids, check if starting bid meets reserve
      IF auction_record.reserve_price IS NOT NULL THEN
        reserve_met_status := auction_record.starting_bid >= auction_record.reserve_price;
      END IF;
    END IF;
    
    -- Update auction status
    UPDATE public.auction_items
    SET 
      status = 'Ended',
      winner_id = winner_id_final,
      final_selling_price = final_price,
      ended_at = now(),
      reserve_met = reserve_met_status,
      updated_at = now()
    WHERE id = auction_id;
    
    -- Log auction end event
    INSERT INTO public.auction_events (auction_item_id, event_type, user_id, event_data)
    VALUES (
      auction_id,
      'auction_ended',
      winner_id_final,
      jsonb_build_object(
        'final_price', final_price,
        'reserve_met', reserve_met_status,
        'total_bids', auction_record.bid_count,
        'winner_username', COALESCE(highest_bid_record.username, null)
      )
    );
    
    -- Create order if there's a winner
    IF winner_id_final IS NOT NULL AND reserve_met_status THEN
      INSERT INTO public.orders (user_id, total_amount, status, payment_details)
      VALUES (
        winner_id_final,
        final_price,
        'pending_payment',
        jsonb_build_object(
          'auction_id', auction_id,
          'item_title', auction_record.title,
          'type', 'auction_win'
        )
      );
    END IF;
    
    result := jsonb_build_object(
      'success', true,
      'auction_id', auction_id,
      'winner_id', winner_id_final,
      'final_price', final_price,
      'reserve_met', reserve_met_status,
      'total_bids', auction_record.bid_count
    );
    
    RETURN result;
  END;
END;
$$;

-- Create function to check and end expired auctions
CREATE OR REPLACE FUNCTION public.process_expired_auctions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_auction RECORD;
  processed_count integer := 0;
  results jsonb[] := ARRAY[]::jsonb[];
  auction_result jsonb;
BEGIN
  -- Find all expired active auctions
  FOR expired_auction IN 
    SELECT id 
    FROM public.auction_items 
    WHERE status = 'Active' 
    AND end_date <= now()
    ORDER BY end_date ASC
  LOOP
    -- End each auction
    SELECT public.end_auction(expired_auction.id) INTO auction_result;
    results := array_append(results, auction_result);
    processed_count := processed_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'processed_count', processed_count,
    'results', results,
    'timestamp', now()
  );
END;
$$;