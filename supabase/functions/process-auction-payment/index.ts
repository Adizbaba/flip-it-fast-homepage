
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

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid user token')
    }

    const { auctionId } = await req.json()
    
    console.log('Processing payment for auction:', auctionId, 'user:', user.id)

    // Get auction details and verify user is the winner
    const { data: auction, error: auctionError } = await supabaseClient
      .from('auction_items')
      .select('*')
      .eq('id', auctionId)
      .eq('winner_id', user.id)
      .eq('status', 'Ended')
      .single()

    if (auctionError || !auction) {
      throw new Error('Auction not found or user is not the winner')
    }

    // Check if payment already exists
    const { data: existingPayment } = await supabaseClient
      .from('payment_transactions')
      .select('*')
      .eq('item_id', auctionId)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (existingPayment) {
      return new Response(
        JSON.stringify({ error: 'Payment already completed for this auction' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get user profile for payment details
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Initialize Paystack payment
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!paystackSecretKey) {
      throw new Error('Paystack secret key not configured')
    }

    const paymentAmount = Math.round(auction.final_selling_price * 100) // Convert to kobo
    const reference = `auction_${auctionId}_${user.id}_${Date.now()}`

    const paystackPayload = {
      email: user.email,
      amount: paymentAmount,
      reference: reference,
      currency: 'NGN',
      callback_url: `${req.headers.get('origin')}/payment-confirmation?reference=${reference}`,
      metadata: {
        auction_id: auctionId,
        user_id: user.id,
        item_title: auction.title,
        payment_type: 'auction_payment'
      }
    }

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    })

    const paystackData = await paystackResponse.json()

    if (!paystackResponse.ok) {
      throw new Error(`Paystack error: ${paystackData.message}`)
    }

    // Create payment transaction record
    const { error: paymentError } = await supabaseClient
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        item_id: auctionId,
        amount: auction.final_selling_price,
        reference: reference,
        status: 'pending',
        payment_type: 'auction_payment',
        payment_provider: 'paystack',
        payment_details: {
          paystack_reference: reference,
          auction_title: auction.title,
          final_price: auction.final_selling_price
        },
        metadata: {
          auction_id: auctionId,
          payment_url: paystackData.data.authorization_url
        }
      })

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      throw new Error('Failed to create payment record')
    }

    console.log('Payment initialized successfully:', reference)

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          authorization_url: paystackData.data.authorization_url,
          reference: reference,
          amount: auction.final_selling_price
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in process-auction-payment:', error)
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
