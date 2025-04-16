
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import { Separator } from "@/components/ui/separator";
import { Tables } from "@/integrations/supabase/types";

// Define the types for our search results
export type SearchResultItem = Tables<"auction_items"> & {
  profiles?: Tables<"profiles"> | null;
};

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    "Watches", "Electronics", "Vintage", "Collectibles", "Jewelry"
  ]);

  // Get search parameters from URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest";

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing page
  };

  // Perform search with current parameters
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);

      try {
        let queryBuilder = supabase
          .from("auction_items")
          .select("*, profiles!auction_items_seller_id_fkey(*)", { count: "exact" });

        // Apply search query filter if present
        if (query) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${query}%,description.ilike.%${query}%`
          );
        }

        // Apply category filter if present
        if (category) {
          queryBuilder = queryBuilder.eq("category_id", category);
        }

        // Apply price range filters if present
        if (minPrice) {
          queryBuilder = queryBuilder.gte("starting_bid", minPrice);
        }
        if (maxPrice) {
          queryBuilder = queryBuilder.lte("starting_bid", maxPrice);
        }

        // Apply sorting
        switch (sortBy) {
          case "priceAsc":
            queryBuilder = queryBuilder.order("starting_bid", { ascending: true });
            break;
          case "priceDesc":
            queryBuilder = queryBuilder.order("starting_bid", { ascending: false });
            break;
          case "newest":
            queryBuilder = queryBuilder.order("created_at", { ascending: false });
            break;
          case "endingSoon":
            queryBuilder = queryBuilder.order("end_date", { ascending: true });
            break;
          default:
            queryBuilder = queryBuilder.order("created_at", { ascending: false });
        }

        // Apply pagination - 12 items per page
        const itemsPerPage = 12;
        const start = (page - 1) * itemsPerPage;
        queryBuilder = queryBuilder.range(start, start + itemsPerPage - 1);

        const { data, error, count } = await queryBuilder;

        if (error) {
          throw error;
        }

        setResults(data || []);
        setTotalCount(count || 0);

        // Save query to recent searches if it's not empty
        if (query && !recentSearches.includes(query)) {
          const updatedSearches = [query, ...recentSearches].slice(0, 5);
          setRecentSearches(updatedSearches);
          localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category, minPrice, maxPrice, sortBy, page]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Update URL when search parameters change
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
          <SearchBar 
            initialQuery={query} 
            recentSearches={recentSearches} 
            popularSearches={popularSearches}
            onSearch={(q) => {
              updateSearchParams({ q });
              setPage(1);
            }} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <SearchFilters
              selectedCategory={category}
              minPrice={minPrice}
              maxPrice={maxPrice}
              sortBy={sortBy}
              onFilterChange={(filters) => {
                updateSearchParams({
                  category: filters.category,
                  minPrice: filters.minPrice,
                  maxPrice: filters.maxPrice,
                  sortBy: filters.sortBy
                });
                setPage(1);
              }}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {loading ? "Searching..." : `${totalCount} results found`}
                {query && ` for "${query}"`}
              </h2>
            </div>
            <Separator className="mb-6" />
            <SearchResults 
              results={results} 
              loading={loading}
              page={page}
              totalCount={totalCount}
              itemsPerPage={12}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Search;
