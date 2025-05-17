
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define a more specific type for the profiles join result
type ProfilesResponse = {
  username: string;
  avatar_url: string | null;
} | null;

// Define the main item type including the profiles property
type ItemDetail = Database["public"]["Tables"]["auction_items"]["Row"] & {
  profiles?: ProfilesResponse;
};

export const useItemDetail = (itemId: string | null) => {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: async (): Promise<ItemDetail | null> => {
      if (!itemId) return null;

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
      
      // Combine item data with profile data
      const itemWithProfiles: ItemDetail = {
        ...item,
        profiles: profileData
      };
      
      return itemWithProfiles;
    },
    enabled: !!itemId,
  });
};
