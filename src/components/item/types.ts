
import { Json } from "@/integrations/supabase/types";

// Define reusable types for the item components
export type SafeImageArray = string[];

export interface ItemProfile {
  username?: string;
  avatar_url?: string | null;
}

export interface ItemData {
  id: string;
  title: string;
  description: string;
  starting_bid: number;
  buy_now_price?: number | null;
  bid_increment?: number;
  images: SafeImageArray;
  seller_id: string;
  condition: string;
  end_date: string;
  quantity: number;
  category_id?: string;
  profiles?: ItemProfile | null;
}

export interface RelatedItemData {
  id: string;
  title: string;
  description: string;
  starting_bid: number;
  images: SafeImageArray;
  profiles?: {
    username?: string;
  } | null;
}
