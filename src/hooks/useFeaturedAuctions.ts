
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FeaturedAuction {
  id: string;
  title: string;
  images: any;
  starting_bid: number;
  current_bid: number | null;
  bid_count: number;
  end_date: string;
  created_at: string;
  status?: string;
  winner_id?: string | null;
  final_selling_price?: number | null;
  reserve_met?: boolean | null;
  profiles?: {
    username: string;
  };
}

export const useFeaturedAuctions = (limit: number = 8) => {
  const [auctions, setAuctions] = useState<FeaturedAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedAuctions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auction_items')
        .select(`
          id,
          title,
          images,
          starting_bid,
          current_bid,
          bid_count,
          end_date,
          created_at,
          status,
          winner_id,
          final_selling_price,
          reserve_met,
          profiles!fk_auction_items_seller_id (
            username
          )
        `)
        .in('status', ['Active', 'Ended'])
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured auctions:', error);
        setError('Failed to load featured auctions');
        return;
      }

      setAuctions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching featured auctions:', err);
      setError('Failed to load featured auctions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedAuctions();

    // Set up real-time subscription for new auctions
    const channel = supabase
      .channel('featured-auctions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'auction_items',
          filter: 'status=eq.Active'
        },
        () => {
          console.log('New auction added, refreshing featured auctions');
          fetchFeaturedAuctions();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auction_items'
        },
        () => {
          console.log('Auction updated, refreshing featured auctions');
          fetchFeaturedAuctions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { auctions, loading, error, refetch: fetchFeaturedAuctions };
};
