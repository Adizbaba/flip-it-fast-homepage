import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, items } = await req.json();

    if (!orderId || !items || !Array.isArray(items)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, items" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400 
        }
      );
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Process each item in the order
    const stockUpdates = [];
    const errors = [];

    for (const item of items) {
      const { itemId, itemType, quantity, price } = item;

      if (!itemId || !itemType || !quantity) {
        errors.push(`Invalid item data: ${JSON.stringify(item)}`);
        continue;
      }

      // Determine the table to update based on item type
      const tableName = itemType === 'auction' ? 'auction_items' : 'declutter_listings';

      try {
        // First, check current stock
        const { data: currentItem, error: fetchError } = await supabaseAdmin
          .from(tableName)
          .select('quantity, title')
          .eq('id', itemId)
          .single();

        if (fetchError) {
          errors.push(`Failed to fetch item ${itemId}: ${fetchError.message}`);
          continue;
        }

        if (!currentItem) {
          errors.push(`Item ${itemId} not found`);
          continue;
        }

        const currentQuantity = currentItem.quantity || 0;
        const newQuantity = currentQuantity - quantity;

        if (newQuantity < 0) {
          errors.push(`Insufficient stock for item ${currentItem.title}. Available: ${currentQuantity}, Requested: ${quantity}`);
          continue;
        }

        // Update the stock quantity
        const { error: updateError } = await supabaseAdmin
          .from(tableName)
          .update({ 
            quantity: newQuantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId);

        if (updateError) {
          errors.push(`Failed to update stock for item ${itemId}: ${updateError.message}`);
          continue;
        }

        stockUpdates.push({
          itemId,
          itemType,
          title: currentItem.title,
          previousQuantity: currentQuantity,
          newQuantity,
          quantityReduced: quantity
        });

        console.log(`Stock updated for ${currentItem.title}: ${currentQuantity} -> ${newQuantity}`);

      } catch (error) {
        errors.push(`Error processing item ${itemId}: ${error.message}`);
      }
    }

    // Update order status to completed if no errors
    if (errors.length === 0) {
      const { error: orderUpdateError } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderUpdateError) {
        errors.push(`Failed to update order status: ${orderUpdateError.message}`);
      }
    }

    const response = {
      success: errors.length === 0,
      orderId,
      stockUpdates,
      errors,
      message: errors.length === 0 
        ? "Order processed successfully" 
        : `Order processed with ${errors.length} error(s)`
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: errors.length === 0 ? 200 : 207 // 207 = Multi-Status (partial success)
      }
    );

  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error",
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});