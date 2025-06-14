
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
        .select('highest_bid, starting_bid, end_date, seller_id')
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

      // Check if bid amount is higher than current highest bid
      const currentHighest = auctionData.highest_bid || auctionData.starting_bid;
      if (amount <= currentHighest) {
        toast.error(`Bid must be higher than $${currentHighest}`);
        return false;
      }

      // Place the bid
      const { error } = await supabase
        .from('bids')
        .insert({
          auction_item_id: auctionItemId,
          bidder_id: user.id,
          amount: amount
        });

      if (error) throw error;

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
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          profiles:bidder_id (
            username
          )
        `)
        .eq('auction_item_id', auctionItemId)
        .order('amount', { ascending: false });

      if (error) throw error;
      return data || [];
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
