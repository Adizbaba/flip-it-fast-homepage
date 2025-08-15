-- Fix database functions security by adding proper search_path settings
-- This prevents potential SQL injection vulnerabilities and security issues

-- Update all functions to use proper search_path settings
CREATE OR REPLACE FUNCTION public.update_auction_current_bid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Update the auction item with the new highest bid
  UPDATE public.auction_items 
  SET 
    current_bid = NEW.bid_amount,
    highest_bidder_id = NEW.bidder_id,
    bid_count = bid_count + 1,
    updated_at = now()
  WHERE id = NEW.auction_item_id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_bid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  auction_record RECORD;
  current_highest_bid NUMERIC;
BEGIN
  -- Get auction details
  SELECT * INTO auction_record 
  FROM public.auction_items 
  WHERE id = NEW.auction_item_id;
  
  -- Check if auction exists and is active
  IF auction_record IS NULL THEN
    RAISE EXCEPTION 'Auction item not found';
  END IF;
  
  IF auction_record.status != 'Active' THEN
    RAISE EXCEPTION 'Auction is not active';
  END IF;
  
  -- Check if auction has ended
  IF auction_record.end_date <= now() THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;
  
  -- Check if bidder is not the seller
  IF NEW.bidder_id = auction_record.seller_id THEN
    RAISE EXCEPTION 'Seller cannot bid on their own item';
  END IF;
  
  -- Determine current highest bid
  current_highest_bid := COALESCE(auction_record.current_bid, auction_record.starting_bid);
  
  -- Validate bid amount meets minimum increment
  IF NEW.bid_amount <= current_highest_bid THEN
    RAISE EXCEPTION 'Bid must be higher than current bid of %', current_highest_bid;
  END IF;
  
  IF NEW.bid_amount < (current_highest_bid + auction_record.bid_increment) THEN
    RAISE EXCEPTION 'Bid must be at least % (current bid + increment)', (current_highest_bid + auction_record.bid_increment);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.end_auction(auction_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.process_expired_auctions()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.send_outbid_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  outbid_user_id UUID;
  auction_title TEXT;
  previous_bid_amount NUMERIC;
BEGIN
  -- Get the previous highest bidder (who got outbid)
  SELECT highest_bidder_id INTO outbid_user_id
  FROM public.auction_items 
  WHERE id = NEW.auction_item_id;
  
  -- Only proceed if there was a previous bidder and it's not the same person
  IF outbid_user_id IS NOT NULL AND outbid_user_id != NEW.bidder_id THEN
    -- Get auction title and previous bid amount
    SELECT title, current_bid INTO auction_title, previous_bid_amount
    FROM public.auction_items 
    WHERE id = NEW.auction_item_id;
    
    -- Insert notification for outbid user
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      data
    ) VALUES (
      outbid_user_id,
      'outbid',
      'You''ve Been Outbid!',
      'Someone placed a higher bid on "' || auction_title || '"',
      jsonb_build_object(
        'auction_id', NEW.auction_item_id,
        'auction_title', auction_title,
        'new_bid_amount', NEW.bid_amount,
        'previous_bid_amount', previous_bid_amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_declutter_listing_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.edit_count = OLD.edit_count + 1;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_auction_ended_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  auction_record RECORD;
BEGIN
  -- Only proceed if auction status changed to 'Ended'
  IF NEW.status = 'Ended' AND OLD.status != 'Ended' THEN
    SELECT * INTO auction_record FROM public.auction_items WHERE id = NEW.id;
    
    -- Send winner notification if there's a winner
    IF auction_record.winner_id IS NOT NULL THEN
      INSERT INTO public.notifications (
        user_id, 
        type, 
        title, 
        message, 
        data
      ) VALUES (
        auction_record.winner_id,
        'won_auction',
        'Congratulations! You Won!',
        'You won the auction for "' || auction_record.title || '"',
        jsonb_build_object(
          'auction_id', auction_record.id,
          'auction_title', auction_record.title,
          'winning_bid', auction_record.final_selling_price,
          'payment_required', true
        )
      );
    END IF;
    
    -- Send seller notification
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      data
    ) VALUES (
      auction_record.seller_id,
      CASE 
        WHEN auction_record.winner_id IS NOT NULL THEN 'auction_sold'
        ELSE 'auction_ended_no_winner'
      END,
      CASE 
        WHEN auction_record.winner_id IS NOT NULL THEN 'Your Auction Sold!'
        ELSE 'Your Auction Ended'
      END,
      CASE 
        WHEN auction_record.winner_id IS NOT NULL THEN 
          'Your auction for "' || auction_record.title || '" sold for ₦' || auction_record.final_selling_price
        ELSE 
          'Your auction for "' || auction_record.title || '" ended without meeting the reserve price'
      END,
      jsonb_build_object(
        'auction_id', auction_record.id,
        'auction_title', auction_record.title,
        'final_price', auction_record.final_selling_price,
        'winner_id', auction_record.winner_id,
        'reserve_met', auction_record.reserve_met
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_users_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.send_auction_live_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only proceed if auction status changed to 'Active'
  IF NEW.status = 'Active' AND OLD.status != 'Active' THEN
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      data
    ) VALUES (
      NEW.seller_id,
      'auction_live',
      'Your Auction is Live!',
      'Your auction for "' || NEW.title || '" is now live and accepting bids',
      jsonb_build_object(
        'auction_id', NEW.id,
        'auction_title', NEW.title,
        'starting_bid', NEW.starting_bid,
        'end_date', NEW.end_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public', 'extensions'
AS $function$
BEGIN
    -- Function logic here
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_user_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.profiles
  SET updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_action(admin_id uuid, action text, entity_type text, entity_id uuid, details jsonb, ip_address text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, entity_type, entity_id, details, ip_address)
  VALUES (admin_id, action, entity_type, entity_id, details, ip_address)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_admin_permission(user_id uuid, required_role admin_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = $1 
    AND (role = 'super_admin' OR role = required_role)
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.has_admin_role(user_id uuid, required_role admin_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = $1 
    AND role = required_role
    AND is_active = true
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE user_id = $1 
    AND is_active = true
  );
$function$;