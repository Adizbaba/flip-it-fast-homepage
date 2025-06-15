
import { useState, useEffect } from "react";
import { useSearchParams as useRouterSearchParams } from "react-router-dom";
import { useSearch, SearchFilters } from "@/hooks/useSearch";

interface UseSearchParamsOptions {
  initialQuery?: string;
  itemsPerPage?: number;
}

export const useSearchParamsState = ({ 
  initialQuery = "", 
  itemsPerPage = 12 
}: UseSearchParamsOptions = {}) => {
  const [searchParams, setSearchParams] = useRouterSearchParams();

  const initialFilters: SearchFilters = {
    query: searchParams.get("q") || initialQuery,
    category: searchParams.get("category") || "all",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    condition: searchParams.get("condition") || "all",
    auctionType: searchParams.get("auctionType") || "all"
  };

  const {
    results,
    loading,
    totalCount,
    page,
    setPage,
    filters,
    setFilters
  } = useSearch(initialFilters);

  // Update search params whenever filters change
  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "all") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  // When a filter changes
  const handleFilterChange = (newFilters: Record<string, string>) => {
    updateSearchParams(newFilters);
    setFilters({ ...filters, ...newFilters });
    setPage(1); // Reset to first page when filters change
  };

  // When search query changes
  const handleSearch = (query: string) => {
    setFilters({ ...filters, query });
    updateSearchParams({ q: query });
    setPage(1);
  };

  // Get current page from URL
  useEffect(() => {
    const pageParam = searchParams.get("page");
    if (pageParam) {
      const pageNumber = parseInt(pageParam, 10);
      if (!isNaN(pageNumber) && pageNumber > 0) {
        setPage(pageNumber);
      }
    }
  }, [searchParams, setPage]);

  // Update URL when page changes
  useEffect(() => {
    if (page > 1) {
      updateSearchParams({ page: page.toString() });
    } else {
      // Remove page param if we're on page 1
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("page");
      setSearchParams(newSearchParams);
    }
  }, [page]);

  return {
    results,
    loading,
    totalCount,
    page,
    filters,
    itemsPerPage,
    setPage,
    handleFilterChange,
    handleSearch
  };
};
