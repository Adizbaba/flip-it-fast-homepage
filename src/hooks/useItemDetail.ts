
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Define a type for the profiles join result that can handle both successful and error cases
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
      
      // Handle the response by explicitly converting to our expected type
      const itemWithProfiles: ItemDetail = {
        ...item as Database["public"]["Tables"]["auction_items"]["Row"],
        profiles: item?.profiles as ProfilesResponse
      };
      
      return itemWithProfiles;
    },
    enabled: !!itemId,
  });
};
