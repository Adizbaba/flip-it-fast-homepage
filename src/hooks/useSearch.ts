
import { useState, useEffect, useCallback } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key

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

  // Function to force refresh the results
  const refreshResults = useCallback(() => {
    console.log("Manually refreshing results");
    setRefreshKey(prev => prev + 1);
  }, []);

  // Fetch results based on filters
  useEffect(() => {
    const fetchResults = async () => {
      console.log("Fetching auction results with filters:", filters);
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

        // Only show active listings - THIS IS CRITICAL
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

        console.log("Executing query for auction items...");
        const { data: items, error, count } = await queryBuilder;

        if (error) {
          console.error("Error fetching auction items:", error);
          throw error;
        }

        console.log(`Found ${items?.length || 0} auction items, total: ${count || 0}`);
        
        // Process items to ensure images are properly formatted as string arrays and profiles are typed correctly
        const processedItems: SearchResultItem[] = (items || []).map(item => {
          const processedItem = {
            ...item,
            images: processImageData(item.images),
            profiles: processProfileData(item.profiles)
          };
          console.log("Processed item:", {
            id: processedItem.id,
            title: processedItem.title,
            images: processedItem.images?.length || 0,
            status: processedItem.status
          });
          return processedItem;
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
  }, [filters, page, refreshKey]);

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
          console.log("Real-time update detected:", payload.eventType, payload.new?.id);
          
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
                  console.log("New item fetched via real-time:", newItemData.title);
                  
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
                    console.log("Adding new item to results:", newItem.title);
                    setResults(prevResults => {
                      const updatedResults = [newItem, ...prevResults];
                      // Keep only first 10 items if we're on page 1
                      return updatedResults.slice(0, 10);
                    });
                    
                    setTotalCount(prev => prev + 1);
                  } else if (itemExists) {
                    // Update existing item
                    console.log("Updating existing item in results:", newItem.title);
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
    
    console.log("Real-time subscription established for search results");

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
    refreshResults
  };
};
