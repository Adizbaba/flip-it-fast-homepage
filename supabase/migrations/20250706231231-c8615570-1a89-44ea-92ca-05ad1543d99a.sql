-- Create bids table for auction bidding system
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auction_item_id UUID NOT NULL,
  bidder_id UUID NOT NULL,
  bid_amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.bids 
ADD CONSTRAINT fk_bids_auction_item_id 
FOREIGN KEY (auction_item_id) REFERENCES public.auction_items(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_bids_auction_item_id ON public.bids(auction_item_id);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX idx_bids_bidder_id ON public.bids(bidder_id);

-- Enable Row Level Security
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bids
CREATE POLICY "Anyone can view bids" 
ON public.bids 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can place bids" 
ON public.bids 
FOR INSERT 
WITH CHECK (auth.uid() = bidder_id);

-- Add current_bid column to auction_items to track highest bid
ALTER TABLE public.auction_items 
ADD COLUMN current_bid NUMERIC DEFAULT NULL,
ADD COLUMN highest_bidder_id UUID DEFAULT NULL,
ADD COLUMN bid_count INTEGER DEFAULT 0;

-- Create function to update current bid when new bid is placed
CREATE OR REPLACE FUNCTION public.update_auction_current_bid()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update auction item when bid is placed
CREATE TRIGGER update_auction_current_bid_trigger
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.update_auction_current_bid();

-- Create function to validate bids before insertion
CREATE OR REPLACE FUNCTION public.validate_bid()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to validate bids before insertion
CREATE TRIGGER validate_bid_trigger
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_bid();

-- Enable realtime for bids table
ALTER TABLE public.bids REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- Enable realtime for auction_items updates
ALTER TABLE public.auction_items REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_items;