
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  email: string;
  userId?: string;
  itemId?: string;
  paymentType: "bid" | "listing" | "purchase";
  reference?: string;
  metadata?: Record<string, any>;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not defined");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not set");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get request data
    const { amount, email, userId, itemId, paymentType, metadata } = await req.json() as PaymentRequest;

    if (!amount || !email || !paymentType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare payment data for Paystack
    const amountInKobo = Math.round(amount * 100); // Convert to kobo (smallest currency unit)
    
    const paymentData = {
      amount: amountInKobo,
      email: email,
      metadata: {
        userId,
        itemId,
        paymentType,
        ...metadata
      },
      callback_url: `${req.headers.get("origin")}/payment-confirmation`
    };

    // Initialize transaction with Paystack
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error("Paystack error:", paystackData);
      return new Response(
        JSON.stringify({ error: "Failed to initialize payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log payment in database
    if (userId) {
      const { error: dbError } = await supabase
        .from("payment_transactions")
        .insert({
          user_id: userId,
          amount,
          item_id: itemId,
          payment_type: paymentType,
          reference: paystackData.data.reference,
          status: "pending",
          payment_provider: "paystack",
          metadata: metadata
        });

      if (dbError) {
        console.error("Error logging payment:", dbError);
      }
    }

    return new Response(
      JSON.stringify(paystackData),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
