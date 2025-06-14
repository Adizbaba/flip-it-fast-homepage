
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define a more specific type for the profiles join result
type ProfilesResponse = {
  username: string;
  avatar_url: string | null;
} | null;

// Define the main item type including the profiles property and highest_bid
type ItemDetail = Database["public"]["Tables"]["auction_items"]["Row"] & {
  profiles?: ProfilesResponse;
  highest_bid?: number; // Add this as optional until types are updated
};

// Helper function to process images from various formats to array of strings
const processImages = (images: any): string[] => {
  if (!images) return ["/placeholder.svg"];
  
  try {
    // If it's already an array of strings
    if (Array.isArray(images)) {
      return images.length > 0 ? images.map(img => String(img || "")) : ["/placeholder.svg"];
    }
    
    // If it's a JSON string that contains an array
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) {
          return parsed.length > 0 ? parsed.map(img => String(img || "")) : ["/placeholder.svg"];
        }
        // If it's a single string (URL)
        return [images];
      } catch (e) {
        // If not valid JSON, treat as a single URL
        return [images];
      }
    }
    
    // If it's an object with url property (from Supabase Storage)
    if (images && typeof images === 'object' && 'url' in images) {
      return [String(images.url)];
    }
    
    // Default fallback
    return ["/placeholder.svg"];
  } catch (error) {
    console.error("Error processing images:", error);
    return ["/placeholder.svg"];
  }
};

export const useItemDetail = (itemId: string | null) => {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: async (): Promise<ItemDetail | null> => {
      if (!itemId) return null;
      
      console.log("Fetching item detail for:", itemId);

      // First, let's fetch the item without trying to join the profiles table
      const { data: item, error } = await supabase
        .from("auction_items")
        .select("*")
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        throw error;
      }

      // Then, if we successfully got the item, fetch the seller profile separately
      let profileData = null;
      if (item && item.seller_id) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", item.seller_id)
          .single();

        if (profileError) {
          console.log("Could not fetch seller profile:", profileError);
          // Non-blocking error, we'll continue with null profile
        } else {
          profileData = profile;
        }
      }

      // Try to get highest bid if available
      let highestBid = item.starting_bid;
      try {
        const { data: bidData } = await supabase
          .from('bids' as any)
          .select('amount')
          .eq('auction_item_id', itemId)
          .order('amount', { ascending: false })
          .limit(1)
          .single();
        
        // Combined null and type checking in a single condition
        if (bidData !== null && bidData !== undefined && typeof bidData === 'object' && 'amount' in bidData) {
          const amount = (bidData as { amount: number }).amount;
          if (typeof amount === 'number') {
            highestBid = amount;
          }
        }
      } catch (bidError) {
        console.log("Bids not available yet:", bidError);
        // Use starting_bid as fallback
      }
      
      // Process the images to ensure they're in a consistent format
      const processedImages = processImages(item.images);
      
      // Combine item data with profile data and processed images
      const itemWithProfiles: ItemDetail = {
        ...item,
        images: processedImages,
        profiles: profileData,
        highest_bid: highestBid
      };
      
      console.log("Processed item data:", itemWithProfiles);
      
      return itemWithProfiles;
    },
    enabled: !!itemId,
  });
};
