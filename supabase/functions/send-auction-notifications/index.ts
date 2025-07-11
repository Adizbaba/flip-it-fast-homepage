import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationData {
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
}

const getEmailTemplate = (notification: NotificationData, userEmail: string, userProfile: any) => {
  const { type, title, message, data } = notification;
  const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || '';
  
  switch (type) {
    case 'outbid':
      return {
        subject: `You've Been Outbid - ${data.auction_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">You've Been Outbid!</h2>
            <p>Hi ${userProfile?.full_name || 'there'},</p>
            <p>Someone placed a higher bid on <strong>"${data.auction_title}"</strong></p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Your previous bid:</strong> ₦${data.previous_bid_amount?.toLocaleString()}</p>
              <p><strong>New highest bid:</strong> ₦${data.new_bid_amount?.toLocaleString()}</p>
            </div>
            <p>Don't lose out! Place a higher bid to stay in the running.</p>
            <a href="${baseUrl}/item/${data.auction_id}" 
               style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              View Auction & Place Bid
            </a>
            <p>Best regards,<br>The FastFlip Team</p>
          </div>
        `
      };
      
    case 'won_auction':
      return {
        subject: `Congratulations! You Won - ${data.auction_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">🎉 Congratulations! You Won!</h2>
            <p>Hi ${userProfile?.full_name || 'there'},</p>
            <p>Fantastic news! You won the auction for <strong>"${data.auction_title}"</strong></p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>Winning bid:</strong> ₦${data.winning_bid?.toLocaleString()}</p>
              <p><strong>Item:</strong> ${data.auction_title}</p>
            </div>
            <p><strong>Next steps:</strong></p>
            <ul>
              <li>Complete your payment within 48 hours</li>
              <li>Provide shipping details</li>
              <li>Wait for seller confirmation</li>
            </ul>
            <a href="${baseUrl}/payment/auction/${data.auction_id}" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Pay Now - ₦${data.winning_bid?.toLocaleString()}
            </a>
            <p>Best regards,<br>The FastFlip Team</p>
          </div>
        `
      };
      
    case 'auction_live':
      return {
        subject: `Your Auction is Live - ${data.auction_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">🚀 Your Auction is Live!</h2>
            <p>Hi ${userProfile?.full_name || 'there'},</p>
            <p>Great news! Your auction for <strong>"${data.auction_title}"</strong> is now live and accepting bids.</p>
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p><strong>Starting bid:</strong> ₦${data.starting_bid?.toLocaleString()}</p>
              <p><strong>Ends:</strong> ${new Date(data.end_date).toLocaleDateString()}</p>
            </div>
            <p>Your item is now visible to all bidders. We'll notify you of any bids!</p>
            <a href="${baseUrl}/item/${data.auction_id}" 
               style="background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              View Your Auction
            </a>
            <p>Best regards,<br>The FastFlip Team</p>
          </div>
        `
      };
      
    case 'auction_sold':
      return {
        subject: `Your Auction Sold - ${data.auction_title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">💰 Your Auction Sold!</h2>
            <p>Hi ${userProfile?.full_name || 'there'},</p>
            <p>Excellent news! Your auction for <strong>"${data.auction_title}"</strong> has sold!</p>
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p><strong>Final selling price:</strong> ₦${data.final_price?.toLocaleString()}</p>
              <p><strong>Reserve met:</strong> ${data.reserve_met ? 'Yes' : 'No'}</p>
            </div>
            <p><strong>Next steps:</strong></p>
            <ul>
              <li>Wait for buyer payment confirmation</li>
              <li>Prepare item for shipping</li>
              <li>We'll notify you when payment is received</li>
            </ul>
            <a href="${baseUrl}/dashboard/seller/listings" 
               style="background: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              View Seller Dashboard
            </a>
            <p>Best regards,<br>The FastFlip Team</p>
          </div>
        `
      };
      
    default:
      return {
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">${title}</h2>
            <p>Hi ${userProfile?.full_name || 'there'},</p>
            <p>${message}</p>
            <p>Best regards,<br>The FastFlip Team</p>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id } = await req.json();
    
    // Get the notification details
    const { data: notification, error: notificationError } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('id', notification_id)
      .single();
      
    if (notificationError || !notification) {
      throw new Error('Notification not found');
    }
    
    // Skip if email already sent
    if (notification.email_sent) {
      return new Response(JSON.stringify({ message: 'Email already sent' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get user profile and email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', notification.user_id)
      .single();
      
    if (profileError || !profile) {
      throw new Error('User profile not found');
    }
    
    // Get user email from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(notification.user_id);
    
    if (userError || !user?.email) {
      throw new Error('User email not found');
    }
    
    // Generate email content
    const emailTemplate = getEmailTemplate(notification, user.email, profile);
    
    // Send email
    const emailResponse = await resend.emails.send({
      from: "FastFlip <onboarding@resend.dev>",
      to: [user.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });
    
    // Mark email as sent
    await supabaseClient
      .from('notifications')
      .update({ email_sent: true })
      .eq('id', notification_id);
    
    console.log("Notification email sent successfully:", emailResponse);
    
    return new Response(JSON.stringify({ 
      message: "Email sent successfully",
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error: any) {
    console.error("Error in send-auction-notifications function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);