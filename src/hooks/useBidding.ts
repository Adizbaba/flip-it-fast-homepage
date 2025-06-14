
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

      // Use raw SQL to insert bid since the bids table might not be in types yet
      const { error } = await supabase.rpc('exec_sql', {
        sql: `INSERT INTO bids (auction_item_id, bidder_id, amount) VALUES ($1, $2, $3)`,
        params: [auctionItemId, user.id, amount]
      });

      if (error) {
        // Fallback: try direct insert (this will work once types are updated)
        const { error: insertError } = await supabase
          .from('bids' as any)
          .insert({
            auction_item_id: auctionItemId,
            bidder_id: user.id,
            amount: amount
          });
        
        if (insertError) throw insertError;
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
      // Try to fetch bids with a fallback
      const { data, error } = await supabase
        .from('bids' as any)
        .select(`
          *,
          profiles:bidder_id (
            username
          )
        `)
        .eq('auction_item_id', auctionItemId)
        .order('amount', { ascending: false });

      if (error) {
        console.log('Bids table not ready yet:', error);
        return [];
      }
      
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
