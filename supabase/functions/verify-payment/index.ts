
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  reference: string;
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
    
    // Get reference from request
    const { reference } = await req.json() as VerifyRequest;
    
    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Payment reference is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error("Paystack verification error:", verifyData);
      return new Response(
        JSON.stringify({ error: "Failed to verify payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update transaction status in database
    const { data: transaction } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("reference", reference)
      .single();
    
    if (transaction) {
      const status = verifyData.data.status === "success" ? "completed" : verifyData.data.status;
      
      const { error: updateError } = await supabase
        .from("payment_transactions")
        .update({ 
          status: status,
          payment_details: verifyData.data,
          updated_at: new Date().toISOString()
        })
        .eq("reference", reference);
        
      if (updateError) {
        console.error("Error updating transaction:", updateError);
      }
      
      // Handle post-payment actions based on payment type
      if (status === "completed") {
        if (transaction.payment_type === "listing") {
          // Update auction item status if it's a listing fee
          if (transaction.item_id) {
            const { error: itemError } = await supabase
              .from("auction_items")
              .update({ status: "Active" })
              .eq("id", transaction.item_id);
              
            if (itemError) {
              console.error("Error activating listing:", itemError);
            }
          }
        }
        // Additional logic for other payment types can be added here
      }
    }

    return new Response(
      JSON.stringify({
        success: verifyData.data.status === "success",
        data: verifyData.data,
      }),
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
