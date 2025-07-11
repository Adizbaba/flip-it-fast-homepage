import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Checking for auctions ending soon...');
    
    // Find auctions ending in the next 10 minutes
    const now = new Date();
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000);
    
    const { data: endingAuctions, error: auctionsError } = await supabaseClient
      .from('auction_items')
      .select(`
        id,
        title,
        end_date,
        current_bid,
        starting_bid,
        bids!inner(bidder_id)
      `)
      .eq('status', 'Active')
      .gte('end_date', now.toISOString())
      .lte('end_date', tenMinutesFromNow.toISOString());
    
    if (auctionsError) {
      throw auctionsError;
    }
    
    if (!endingAuctions || endingAuctions.length === 0) {
      return new Response(JSON.stringify({ message: 'No auctions ending soon' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Found ${endingAuctions.length} auctions ending soon`);
    
    // Group bidders by auction and send notifications
    for (const auction of endingAuctions) {
      // Get unique bidders for this auction
      const uniqueBidders = [...new Set(auction.bids.map(bid => bid.bidder_id))];
      
      const timeRemaining = Math.ceil((new Date(auction.end_date).getTime() - now.getTime()) / (1000 * 60));
      const currentBid = auction.current_bid || auction.starting_bid;
      
      // Create notifications for each bidder
      for (const bidderId of uniqueBidders) {
        // Check if we already sent a notification for this auction ending
        const { data: existingNotification } = await supabaseClient
          .from('notifications')
          .select('id')
          .eq('user_id', bidderId)
          .eq('type', 'auction_ending')
          .eq('data->>auction_id', auction.id)
          .single();
        
        if (existingNotification) {
          continue; // Skip if already notified
        }
        
        // Insert notification
        const { error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            user_id: bidderId,
            type: 'auction_ending',
            title: `Auction Ending Soon!`,
            message: `"${auction.title}" ends in ${timeRemaining} minutes. Current bid: ₦${currentBid.toLocaleString()}`,
            data: {
              auction_id: auction.id,
              auction_title: auction.title,
              current_bid: currentBid,
              time_remaining_minutes: timeRemaining,
              end_date: auction.end_date
            }
          });
        
        if (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
      }
    }
    
    return new Response(JSON.stringify({ 
      message: `Processed ${endingAuctions.length} ending auctions`,
      auctions: endingAuctions.map(a => ({ id: a.id, title: a.title, end_date: a.end_date }))
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error("Error in auction-ending-alerts function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);