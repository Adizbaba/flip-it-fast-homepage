
import { useState, useEffect } from "react";
import { useSearchParams as useRouterSearchParams } from "react-router-dom";
import { useSearch, SearchFilters } from "@/hooks/useSearch";

interface UseSearchParamsOptions {
  initialQuery?: string;
}

// Add index signature to SearchFilters interface
export interface SearchParamsFilters extends SearchFilters {
  [key: string]: string;
}

export const useSearchParamsState = ({ initialQuery = "" }: UseSearchParamsOptions = {}) => {
  const [searchParams, setSearchParams] = useRouterSearchParams();

  const initialFilters: SearchParamsFilters = {
    query: searchParams.get("q") || initialQuery,
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest",
    condition: searchParams.get("condition") || ""
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

  const updateSearchParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    updateSearchParams(newFilters);
    setFilters({ ...filters, ...newFilters });
    setPage(1);
  };

  const handleSearch = (query: string) => {
    setFilters({ ...filters, query });
    updateSearchParams({ q: query });
    setPage(1);
  };

  return {
    results,
    loading,
    totalCount,
    page,
    filters,
    setPage,
    handleFilterChange,
    handleSearch
  };
};
