import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import { useSearch } from "@/hooks/useSearch";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "react-router-dom";
import { FilterState } from "@/components/search/filters/types";

const AllAuctions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = {
    query: "",
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
  } = useSearch({...initialFilters, query: ""});

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">All Auctions</h1>
          <p className="text-muted-foreground">
            Browse all available auction items and find your next treasure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <SearchFilters
              selectedCategory={filters.category}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              sortBy={filters.sortBy}
              onFilterChange={(newFilters) => {
                updateSearchParams(newFilters);
                setFilters({ ...filters, ...newFilters });
                setPage(1);
              }}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {loading ? "Loading..." : `${totalCount} items available`}
              </h2>
            </div>
            <Separator className="mb-6" />
            <SearchResults 
              results={results} 
              loading={loading}
              page={page}
              totalCount={totalCount}
              itemsPerPage={12}
              onPageChange={setPage}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllAuctions;
