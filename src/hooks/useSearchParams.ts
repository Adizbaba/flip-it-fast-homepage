
import { useState, useEffect, useCallback, useRef } from "react";
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
  const lastFiltersRef = useRef<string>("");

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
    setFilters,
    refreshResults
  } = useSearch(initialFilters);

  // Update search params whenever filters change
  const updateSearchParams = useCallback((params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      // Only set params that have meaningful values
      if (value && value !== "all" && value !== "") {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // When a filter changes - prevent duplicate updates
  const handleFilterChange = useCallback((newFilters: Record<string, string>) => {
    const filtersString = JSON.stringify(newFilters);
    
    // Prevent duplicate filter changes
    if (filtersString === lastFiltersRef.current) {
      return;
    }
    
    lastFiltersRef.current = filtersString;
    console.log("Filter change:", newFilters);
    
    updateSearchParams(newFilters);
    setFilters({ ...filters, ...newFilters });
    setPage(1); // Reset to first page when filters change
  }, [filters, setFilters, setPage, updateSearchParams]);

  // When search query changes
  const handleSearch = useCallback((query: string) => {
    setFilters({ ...filters, query });
    updateSearchParams({ q: query });
    setPage(1);
  }, [filters, setFilters, setPage, updateSearchParams]);

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
  }, [page, updateSearchParams, searchParams, setSearchParams]);

  return {
    results,
    loading,
    totalCount,
    page,
    filters,
    itemsPerPage,
    setPage,
    handleFilterChange,
    handleSearch,
    refreshResults
  };
};
