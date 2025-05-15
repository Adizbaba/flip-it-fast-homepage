import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, Json } from "@/integrations/supabase/types";
import { FilterState, SafeImageArray } from "@/components/search/filters/types";

export type SearchResultItem = Tables<"auction_items"> & {
  profiles?: Tables<"profiles"> | null;
  images: SafeImageArray; // Ensure images are always string array
};

export interface SearchFilters extends FilterState {
  query: string;
}

export const useSearch = (initialFilters: SearchFilters) => {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Helper function to safely process image data
  const processImageData = (imageData: Json | null): SafeImageArray => {
    if (!imageData) return [];
    
    // If it's already an array, map each item to string
    if (Array.isArray(imageData)) {
      return imageData.map(img => String(img));
    }
    
    // If it's a single value, convert to string and wrap in array
    return [String(imageData)];
  };

  // Helper function to safely process profiles data
  const processProfileData = (profileData: any): Tables<"profiles"> | null => {
    // If profileData is null or has an error property, return null
    if (!profileData || profileData.error) {
      return null;
    }
    
    // Otherwise return the profile data as is
    return profileData as Tables<"profiles">;
  };

  // Fetch results based on filters
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      try {
        let queryBuilder = supabase
          .from("auction_items")
          .select("*, profiles:seller_id(*)", { count: "exact" });

        // Filter by query text
        if (filters.query) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
          );
        }

        // Filter by category
        if (filters.category && filters.category !== "all") {
          queryBuilder = queryBuilder.eq("category_id", filters.category);
        }

        // Filter by price range
        if (filters.minPrice) {
          queryBuilder = queryBuilder.gte("starting_bid", filters.minPrice);
        }
        if (filters.maxPrice) {
          queryBuilder = queryBuilder.lte("starting_bid", filters.maxPrice);
        }

        // Filter by auction type
        if (filters.auctionType && filters.auctionType !== "all") {
          queryBuilder = queryBuilder.eq("auction_type", filters.auctionType);
        }

        // Filter by condition
        if (filters.condition && filters.condition !== "all") {
          queryBuilder = queryBuilder.eq("condition", filters.condition);
        }

        // Only show active listings
        queryBuilder = queryBuilder.eq("status", "Active");

        // Sort results
        switch (filters.sortBy) {
          case "priceAsc":
            queryBuilder = queryBuilder.order("starting_bid", { ascending: true });
            break;
          case "priceDesc":
            queryBuilder = queryBuilder.order("starting_bid", { ascending: false });
            break;
          case "endingSoon":
            queryBuilder = queryBuilder.order("end_date", { ascending: true });
            break;
          default:
            queryBuilder = queryBuilder.order("created_at", { ascending: false });
        }

        const itemsPerPage = 10; // Set to 10 as requested
        const start = (page - 1) * itemsPerPage;
        queryBuilder = queryBuilder.range(start, start + itemsPerPage - 1);

        const { data: items, error, count } = await queryBuilder;

        if (error) {
          throw error;
        }

        // Process items to ensure images are properly formatted as string arrays and profiles are typed correctly
        const processedItems: SearchResultItem[] = (items || []).map(item => {
          return {
            ...item,
            images: processImageData(item.images),
            profiles: processProfileData(item.profiles)
          };
        });

        setResults(processedItems);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, page]);

  // Set up real-time subscription for new or updated items
  useEffect(() => {
    // Enable real-time subscription to auction_items
    const channel = supabase
      .channel('public:auction_items')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for inserts and updates
          schema: 'public',
          table: 'auction_items'
        },
        (payload) => {
          // If it's a new item or an update, refresh the query
          if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && 
              payload.new.status === 'Active') {
            // Get the new item
            const fetchNewItem = async () => {
              try {
                const { data: newItemData } = await supabase
                  .from("auction_items")
                  .select("*, profiles:seller_id(*)")
                  .eq("id", payload.new.id)
                  .single();

                if (newItemData) {
                  // Process the new item data
                  const newItem: SearchResultItem = {
                    ...newItemData,
                    images: processImageData(newItemData.images),
                    profiles: processProfileData(newItemData.profiles)
                  };

                  // Check if item is already in results
                  const itemExists = results.some(item => item.id === newItem.id);
                  
                  if (!itemExists && page === 1) {
                    // Only add new items if we're on the first page
                    setResults(prevResults => {
                      const updatedResults = [newItem, ...prevResults];
                      // Keep only first 10 items if we're on page 1
                      return updatedResults.slice(0, 10);
                    });
                    
                    setTotalCount(prev => prev + 1);
                  } else if (itemExists) {
                    // Update existing item
                    setResults(prevResults => 
                      prevResults.map(item => 
                        item.id === newItem.id ? newItem : item
                      )
                    );
                  }
                }
              } catch (error) {
                console.error("Error processing real-time update:", error);
              }
            };
            
            fetchNewItem();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, results]);

  return {
    results,
    loading,
    totalCount,
    page,
    setPage,
    filters,
    setFilters,
  };
};
