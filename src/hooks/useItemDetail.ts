
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
      
      const { data: item, error } = await supabase
        .from("auction_items")
        .select(`
          *,
          profiles:seller_id (
            username,
            avatar_url
          )
        `)
        .eq("id", itemId)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
        throw error;
      }
      
      // Handle the response by safely converting to our expected type
      const itemWithProfiles: ItemDetail = {
        ...item as Database["public"]["Tables"]["auction_items"]["Row"],
        // Fixed: Added additional null checks and safe type conversion
        profiles: item && item.profiles ? 
          (typeof item.profiles === 'object' && 
           'username' in (item.profiles as any) ? 
            {
              username: (item.profiles as any).username || "Unknown seller",
              avatar_url: (item.profiles as any).avatar_url || null
            } : null) 
          : null
      };
      
      return itemWithProfiles;
    },
    enabled: !!itemId,
  });
};
