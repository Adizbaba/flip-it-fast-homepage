import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export interface Bid {
  id: string;
  auction_item_id: string;
  bidder_id: string;
  bid_amount: number;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export interface AuctionItemWithBids {
  id: string;
  title: string;
  current_bid: number | null;
  starting_bid: number;
  bid_increment: number;
  highest_bidder_id: string | null;
  bid_count: number;
  end_date: string;
  seller_id: string;
  status: string;
  reserve_price: number | null;
  winner_id: string | null;
  final_selling_price: number | null;
  reserve_met: boolean | null;
}

export const useBidding = (auctionItemId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Fetch auction item details
  const { data: auctionItem, isLoading: auctionLoading } = useQuery({
    queryKey: ["auction-item", auctionItemId],
    queryFn: async (): Promise<AuctionItemWithBids | null> => {
      if (!auctionItemId) return null;
      
      const { data, error } = await supabase
        .from("auction_items")
        .select("id, title, current_bid, starting_bid, bid_increment, highest_bidder_id, bid_count, end_date, seller_id, status, reserve_price, winner_id, final_selling_price, reserve_met")
        .eq("id", auctionItemId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!auctionItemId,
  });

  // Fetch bid history
  const { data: bids = [], isLoading: bidsLoading } = useQuery({
    queryKey: ["bids", auctionItemId],
    queryFn: async (): Promise<Bid[]> => {
      if (!auctionItemId) return [];
      
      // First get the bids
      const { data: bidsData, error: bidsError } = await supabase
        .from("bids")
        .select("id, auction_item_id, bidder_id, bid_amount, created_at")
        .eq("auction_item_id", auctionItemId)
        .order("created_at", { ascending: false });

      if (bidsError) throw bidsError;
      if (!bidsData) return [];

      // Then get the profiles for each unique bidder
      const bidderIds = [...new Set(bidsData.map(bid => bid.bidder_id))];
      const { data: profilesData, error: profilesError } = await (supabase as any)
        .from("safe_public_profiles")
        .select("id, username, avatar_url")
        .in("id", bidderIds);

      if (profilesError) {
        console.warn("Failed to fetch profiles:", profilesError);
      }

      // Combine the data
      const bidsWithProfiles = bidsData.map(bid => ({
        ...bid,
        profiles: profilesData?.find(profile => profile.id === bid.bidder_id)
      }));

      return bidsWithProfiles;
    },
    enabled: !!auctionItemId,
  });

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (bidAmount: number) => {
      if (!user || !auctionItemId) {
        throw new Error("User not authenticated or auction item not found");
      }

      const { data, error } = await supabase
        .from("bids")
        .insert({
          auction_item_id: auctionItemId,
          bidder_id: user.id,
          bid_amount: bidAmount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Bid placed successfully!", {
        description: "Your bid has been recorded.",
      });
      // Refetch queries to get updated data
      queryClient.invalidateQueries({ queryKey: ["bids", auctionItemId] });
      queryClient.invalidateQueries({ queryKey: ["auction-item", auctionItemId] });
    },
    onError: (error: any) => {
      toast.error("Failed to place bid", {
        description: error.message || "Please try again.",
      });
    },
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!auctionItemId) return;

    const channel = supabase
      .channel(`auction-${auctionItemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `auction_item_id=eq.${auctionItemId}`,
        },
        (payload) => {
          // Refetch bids when new bid is placed
          queryClient.invalidateQueries({ queryKey: ["bids", auctionItemId] });
          queryClient.invalidateQueries({ queryKey: ["auction-item", auctionItemId] });
          
          // Show toast if it's not the current user's bid
          if (payload.new.bidder_id !== user?.id) {
            toast.info("New bid placed!", {
              description: `Someone bid ₦${payload.new.bid_amount}`,
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auction_items",
          filter: `id=eq.${auctionItemId}`,
        },
        () => {
          // Refetch auction item when it's updated
          queryClient.invalidateQueries({ queryKey: ["auction-item", auctionItemId] });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auctionItemId, user?.id, queryClient]);

  const getCurrentBid = () => {
    if (!auctionItem) return 0;
    return auctionItem.current_bid || auctionItem.starting_bid;
  };

  const getMinimumBid = () => {
    const currentBid = getCurrentBid();
    const increment = auctionItem?.bid_increment || 1;
    return currentBid + increment;
  };

  const canBid = () => {
    if (!user || !auctionItem) return false;
    if (user.id === auctionItem.seller_id) return false;
    if (auctionItem.status !== "Active") return false;
    if (new Date(auctionItem.end_date) <= new Date()) return false;
    return true;
  };

  const isUserHighestBidder = () => {
    if (!user || !auctionItem) return false;
    return user.id === auctionItem.highest_bidder_id;
  };

  return {
    auctionItem,
    bids,
    isLoading: auctionLoading || bidsLoading,
    isConnected,
    placeBid: placeBidMutation.mutate,
    isPlacingBid: placeBidMutation.isPending,
    getCurrentBid,
    getMinimumBid,
    canBid,
    isUserHighestBidder,
  };
};