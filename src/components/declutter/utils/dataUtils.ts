
import { Json } from "@/integrations/supabase/types";

/**
 * Safely access seller username from profiles object
 */
export const getSellerUsername = (profiles: any): string => {
  if (!profiles) return "Unknown seller";
  if (typeof profiles === 'object' && 'username' in profiles) {
    return profiles.username || "Unknown seller";
  }
  return "Unknown seller";
};

/**
 * Convert Json array to string array for images
 */
export const convertJsonToStringArray = (images: Json | null): string[] => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map(img => String(img));
  }
  return [String(images)];
};

