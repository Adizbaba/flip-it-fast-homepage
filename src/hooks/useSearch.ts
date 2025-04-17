import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { FilterState } from "@/components/search/filters/types";

export type SearchResultItem = Tables<"auction_items"> & {
  profiles?: Tables<"profiles"> | null;
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

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      try {
        let queryBuilder = supabase
          .from("auction_items")
          .select("*", { count: "exact" });

        // Filter by query text
        if (filters.query) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
          );
        }

        // Filter by category
        if (filters.category) {
          queryBuilder = queryBuilder.eq("category_id", filters.category);
        }

        // Filter by price range
        if (filters.minPrice) {
          queryBuilder = queryBuilder.gte("starting_bid", filters.minPrice);
        }
        if (filters.maxPrice) {
          queryBuilder = queryBuilder.lte("starting_bid", filters.maxPrice);
        }

        // Filter by condition
        if (filters.condition) {
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

        const itemsPerPage = 12;
        const start = (page - 1) * itemsPerPage;
        queryBuilder = queryBuilder.range(start, start + itemsPerPage - 1);

        const { data: itemsData, error: itemsError, count } = await queryBuilder;

        if (itemsError) {
          throw itemsError;
        }

        const items = itemsData || [];
        const enrichedItems: SearchResultItem[] = [...items];

        if (items.length > 0) {
          const sellerIds = items.map(item => item.seller_id);
          const uniqueSellerIds = [...new Set(sellerIds)];

          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", uniqueSellerIds);

          if (!profilesError && profilesData) {
            enrichedItems.forEach(item => {
              item.profiles = profilesData.find(profile => profile.id === item.seller_id) || null;
            });
          }
        }

        setResults(enrichedItems);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [filters, page]);

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
