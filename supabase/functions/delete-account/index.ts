import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteAccountRequest {
  currentPassword: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create client for user operations
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set the auth header for user client
    supabaseUser.auth.session = null;
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { currentPassword }: DeleteAccountRequest = await req.json();

    if (!currentPassword) {
      return new Response(
        JSON.stringify({ error: 'Current password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabaseUser.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: 'Invalid current password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting account deletion for user: ${user.id}`);

    // Delete user data in the correct order (respecting foreign key constraints)
    const userId = user.id;

    try {
      // 1. Delete auction-related data first
      await supabaseAdmin.from('bids').delete().eq('bidder_id', userId);
      await supabaseAdmin.from('auction_events').delete().eq('user_id', userId);
      
      // 2. Delete auction items (this will cascade to related bids)
      await supabaseAdmin.from('auction_items').delete().eq('seller_id', userId);
      
      // 3. Delete order-related data
      await supabaseAdmin.from('order_items').delete().in('order_id', 
        supabaseAdmin.from('orders').select('id').eq('user_id', userId)
      );
      await supabaseAdmin.from('orders').delete().eq('user_id', userId);
      
      // 4. Delete other user data
      await supabaseAdmin.from('payment_transactions').delete().eq('user_id', userId);
      await supabaseAdmin.from('notifications').delete().eq('user_id', userId);
      await supabaseAdmin.from('saved_items').delete().eq('user_id', userId);
      await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
      await supabaseAdmin.from('declutter_listings').delete().eq('seller_id', userId);
      
      // 5. Delete admin role if exists
      await supabaseAdmin.from('admin_users').delete().eq('user_id', userId);
      
      // 6. Delete profile (this should be last before auth user)
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      
      // 7. Finally delete the auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      
      if (deleteError) {
        console.error('Error deleting auth user:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted account for user: ${userId}`);

      return new Response(
        JSON.stringify({ success: true, message: 'Account deleted successfully' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (dataDeleteError) {
      console.error('Error deleting user data:', dataDeleteError);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete account data. Please contact support.',
          details: dataDeleteError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Account deletion error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});