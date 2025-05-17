
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FilterState } from "@/components/search/filters/types";

// Make SearchFilters compatible with FilterState by adding index signature
export interface SearchFilters extends FilterState {
  query: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition: string;
  auctionType: string;
  [key: string]: string; // Add index signature to fix compatibility issue
}

// Add the SearchResultItem interface that components are trying to import
export interface SearchResultItem {
  id: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  category?: string;
  endDate?: Date;
  description?: string;
  status?: string;
  condition?: string;
  highestBid?: number;
  sellerId?: string;
  auctionType?: string;
  starting_bid?: number;
  profiles?: {
    username?: string;
  }
}

export const useSearch = (initialFilters: SearchFilters) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching with filters:", filters);
      
      // Start building the query
      let query = supabase
        .from('auction_items')
        .select('*, categories(*)', { count: 'exact' })
        .eq('status', 'Active'); // Only get active items
      
      // Apply filters
      if (filters.query) {
        query = query.ilike('title', `%${filters.query}%`);
      }
      
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category_id', filters.category);
      }
      
      if (filters.minPrice) {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice)) {
          query = query.gte('starting_bid', minPrice);
        }
      }
      
      if (filters.maxPrice) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          query = query.lte('starting_bid', maxPrice);
        }
      }
      
      if (filters.condition && filters.condition !== 'all') {
        query = query.eq('condition', filters.condition);
      }
      
      if (filters.auctionType && filters.auctionType !== 'all') {
        query = query.eq('auction_type', filters.auctionType);
      }
      
      // Apply sorting
      switch(filters.sortBy) {
        case 'priceAsc':
          query = query.order('starting_bid', { ascending: true });
          break;
        case 'priceDesc':
          query = query.order('starting_bid', { ascending: false });
          break;
        case 'endingSoon':
          query = query.order('end_date', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
      
      // Apply pagination (items per page is set in the component)
      const itemsPerPage = 10;
      const start = (page - 1) * itemsPerPage;
      query = query.range(start, start + itemsPerPage - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      console.log("Results:", data);
      console.log("Total count:", count);
      
      // Update state with results
      setResults(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Fetch results when filters or page changes
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Function to manually refresh results
  const refreshResults = useCallback(() => {
    fetchResults();
  }, [fetchResults]);

  // Format the results to match the expected structure for the UI components
  const formattedResults: SearchResultItem[] = results.map(item => {
    // Make sure item is an object and has an id before trying to access it
    if (typeof item !== 'object' || item === null) {
      return {
        id: 'unknown',
        title: 'Unknown Item',
        price: 0,
        image: null,
        status: 'unknown'
      };
    }
    
    return {
      id: item.id || 'unknown',
      title: item.title || 'Untitled Item',
      price: item.starting_bid || 0,
      image: item.images && item.images.length > 0 ? item.images[0] : null,
      images: item.images,
      category: item.categories?.name || 'Uncategorized',
      endDate: item.end_date || new Date(),
      description: item.description || '',
      status: item.status || 'unknown',
      condition: item.condition || 'Unknown',
      highestBid: item.highest_bid || item.starting_bid || 0,
      sellerId: item.seller_id || '',
      auctionType: item.auction_type || 'standard',
      starting_bid: item.starting_bid || 0,
      profiles: item.profiles,
    };
  });

  return {
    results: formattedResults,
    loading,
    error,
    totalCount,
    page,
    setPage,
    filters,
    setFilters,
    refreshResults,
  };
};
