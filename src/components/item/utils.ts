
import { Json } from "@/integrations/supabase/types";
import { ItemData, RelatedItemData, SafeImageArray, ItemProfile } from "./types";

// Helper function to safely process image data
export const processImageData = (imageData: Json | null): SafeImageArray => {
  if (!imageData) return [];
  
  try {
    // If it's already an array, map each item to string
    if (Array.isArray(imageData)) {
      return imageData.map(img => String(img || ""));
    }
    
    // If it's a JSON string that contains an array
    if (typeof imageData === 'string') {
      try {
        const parsed = JSON.parse(imageData);
        if (Array.isArray(parsed)) {
          return parsed.map(img => String(img || ""));
        }
      } catch (e) {
        // If it's not valid JSON, treat as a single string
        return [imageData];
      }
    }
    
    // If it's a single value, convert to string and wrap in array
    return [String(imageData)];
  } catch (error) {
    console.error("Error processing image data:", error);
    return ["/placeholder.svg"];
  }
};

// Helper function to safely process profile data
export const processProfileData = (profileData: any): ItemProfile | null => {
  if (!profileData || typeof profileData !== 'object') {
    return null;
  }
  
  return {
    username: profileData.username || 'Unknown seller',
    avatar_url: profileData.avatar_url || null
  };
};

// Fetch item details from Supabase
export const fetchItemDetails = async (supabase: any, itemId: string): Promise<ItemData> => {
  console.log("Fetching item details for ID:", itemId);
  
  const { data, error } = await supabase
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
  
  console.log("Raw item data:", data);
  
  // Process the images to ensure they're a string array
  const safeImages = processImageData(data.images);
  
  // Handle the profiles separately to ensure proper typing
  const itemData: ItemData = {
    ...data,
    profiles: processProfileData(data.profiles),
    images: safeImages
  };
  
  return itemData;
};

// Fetch similar items based on category
export const fetchSimilarItems = async (supabase: any, itemId: string, categoryId: string): Promise<RelatedItemData[]> => {
  const { data, error } = await supabase
    .from("auction_items")
    .select(`
      id,
      title,
      description,
      starting_bid,
      images,
      seller_id,
      profiles:seller_id (
        username
      )
    `)
    .eq("category_id", categoryId)
    .eq("status", "Active")
    .neq("id", itemId)
    .limit(5);

  if (error) throw error;
  
  // Process the items to ensure images are string arrays
  const relatedItems: RelatedItemData[] = (data || []).map(item => {
    const safeImages = processImageData(item.images);
      
    return {
      ...item,
      images: safeImages,
      profiles: processProfileData(item.profiles)
    };
  });
  
  return relatedItems;
};

// Fetch other items from the same seller
export const fetchSellerItems = async (supabase: any, sellerId: string, itemId: string): Promise<RelatedItemData[]> => {
  const { data, error } = await supabase
    .from("auction_items")
    .select(`
      id,
      title,
      description,
      starting_bid,
      images,
      profiles:seller_id (
        username
      )
    `)
    .eq("seller_id", sellerId)
    .eq("status", "Active")
    .neq("id", itemId)
    .limit(5);

  if (error) throw error;
  
  // Process the items to ensure images are string arrays
  const sellerItems: RelatedItemData[] = (data || []).map(item => {
    const safeImages = processImageData(item.images);
      
    return {
      ...item,
      images: safeImages,
      profiles: processProfileData(item.profiles)
    };
  });
  
  return sellerItems;
};
