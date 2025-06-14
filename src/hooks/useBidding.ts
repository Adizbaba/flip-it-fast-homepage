
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export interface Bid {
  id: string;
  auction_item_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export const useBidding = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const placeBid = async (auctionItemId: string, amount: number) => {
    if (!user) {
      toast.error('Please sign in to place a bid');
      return false;
    }

    setLoading(true);
    try {
      // First check if the auction is still active and get current highest bid
      const { data: auctionData, error: auctionError } = await supabase
        .from('auction_items')
        .select('starting_bid, end_date, seller_id')
        .eq('id', auctionItemId)
        .single();

      if (auctionError) throw auctionError;

      // Check if auction has ended
      if (new Date(auctionData.end_date) < new Date()) {
        toast.error('This auction has ended');
        return false;
      }

      // Check if user is trying to bid on their own item
      if (auctionData.seller_id === user.id) {
        toast.error('You cannot bid on your own auction');
        return false;
      }

      // For now, use starting_bid as minimum (will be enhanced when highest_bid is available)
      const minimumBid = auctionData.starting_bid;
      if (amount <= minimumBid) {
        toast.error(`Bid must be higher than $${minimumBid}`);
        return false;
      }

      // Try direct insert into bids table
      const { error } = await supabase
        .from('bids' as any)
        .insert({
          auction_item_id: auctionItemId,
          bidder_id: user.id,
          amount: amount
        });
        
      if (error) {
        console.error('Error placing bid:', error);
        throw error;
      }

      toast.success('Bid placed successfully!');
      return true;
    } catch (error) {
      console.error('Error placing bid:', error);
      toast.error('Failed to place bid. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBids = async (auctionItemId: string): Promise<Bid[]> => {
    try {
      // Try to fetch bids with a simple query first
      const { data, error } = await supabase
        .from('bids' as any)
        .select('*')
        .eq('auction_item_id', auctionItemId)
        .order('amount', { ascending: false });

      if (error) {
        console.log('Bids table not ready yet:', error);
        return [];
      }
      
      // If we got bids, try to get usernames separately
      if (data && data.length > 0) {
        const bidsWithProfiles: Bid[] = await Promise.all(
          data.map(async (bid: any): Promise<Bid> => {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', bid.bidder_id)
                .single();
              
              return {
                id: bid.id,
                auction_item_id: bid.auction_item_id,
                bidder_id: bid.bidder_id,
                amount: bid.amount,
                created_at: bid.created_at,
                profiles: profile ? { username: profile.username } : undefined
              };
            } catch {
              return {
                id: bid.id,
                auction_item_id: bid.auction_item_id,
                bidder_id: bid.bidder_id,
                amount: bid.amount,
                created_at: bid.created_at,
                profiles: undefined
              };
            }
          })
        );
        return bidsWithProfiles;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching bids:', error);
      return [];
    }
  };

  return {
    placeBid,
    getBids,
    loading
  };
};
