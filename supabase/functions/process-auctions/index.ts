import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing expired auctions...')

    // Call the database function to process expired auctions
    const { data, error } = await supabaseClient.rpc('process_expired_auctions')

    if (error) {
      console.error('Error processing auctions:', error)
      throw error
    }

    console.log('Auction processing result:', data)

    // Send notifications for ended auctions
    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        if (result.success) {
          console.log(`Auction ${result.auction_id} ended. Winner: ${result.winner_id || 'None'}, Final price: $${result.final_price}`)
          
          // Here you could trigger email notifications
          // await sendNotifications(result)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${data.processed_count} expired auctions`,
        data: data
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})