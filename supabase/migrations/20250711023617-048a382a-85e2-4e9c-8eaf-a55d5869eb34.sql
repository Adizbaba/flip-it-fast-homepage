-- Create notifications table for tracking notification history
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'outbid', 'won_auction', 'auction_ending', 'auction_live', 'reserve_met', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data like auction_id, bid_amount, etc.
  read BOOLEAN DEFAULT FALSE,
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to send outbid notifications
CREATE OR REPLACE FUNCTION public.send_outbid_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for outbid notifications
CREATE TRIGGER trigger_outbid_notification
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.send_outbid_notification();

-- Create function to send auction ended notifications
CREATE OR REPLACE FUNCTION public.send_auction_ended_notifications()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auction ended notifications
CREATE TRIGGER trigger_auction_ended_notifications
  AFTER UPDATE ON public.auction_items
  FOR EACH ROW
  EXECUTE FUNCTION public.send_auction_ended_notifications();

-- Create function to send auction live notifications
CREATE OR REPLACE FUNCTION public.send_auction_live_notification()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auction live notifications
CREATE TRIGGER trigger_auction_live_notification
  AFTER UPDATE ON public.auction_items
  FOR EACH ROW
  EXECUTE FUNCTION public.send_auction_live_notification();

-- Create index for better performance
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read) WHERE read = false;