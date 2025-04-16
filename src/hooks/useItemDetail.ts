
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ItemDetail = Database["public"]["Tables"]["auction_items"]["Row"] & {
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
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
      return item;
    },
    enabled: !!itemId,
  });
};
