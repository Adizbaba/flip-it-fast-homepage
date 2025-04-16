
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SearchState } from "@/components/search/SearchState";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import { Separator } from "@/components/ui/separator";
import { useSearch } from "@/hooks/useSearch";
import { FilterState } from "@/components/search/SearchFilters";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = {
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "newest"
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

  const handleSearch = (query: string) => {
    setFilters({ ...filters, query });
    updateSearchParams({ q: query });
    setPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <SearchState
          initialQuery={filters.query}
          onSearch={handleSearch}
        />

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
                {loading ? "Searching..." : `${totalCount} results found`}
                {filters.query && ` for "${filters.query}"`}
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

export default Search;
