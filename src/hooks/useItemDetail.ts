
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

export const useItemDetail = (itemId: string) => {
  return useQuery({
    queryKey: ["item", itemId],
    queryFn: async (): Promise<ItemDetail | null> => {
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

      if (error) throw error;
      
      // Handle the response by safely converting to our expected type
      const itemWithProfiles: ItemDetail = {
        ...item as Database["public"]["Tables"]["auction_items"]["Row"],
        // Use a type guard to ensure profiles has the right shape
        profiles: item?.profiles && typeof item.profiles === 'object' && 
          !('error' in item.profiles) && 'username' in item.profiles ? 
          {
            username: (item.profiles as any).username || "Unknown seller",
            avatar_url: (item.profiles as any).avatar_url || null
          } : 
          null
      };
      
      return itemWithProfiles;
    },
    enabled: !!itemId,
  });
};
