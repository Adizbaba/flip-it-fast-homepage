
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import { Separator } from "@/components/ui/separator";
import { FilterState } from "@/components/search/filters/types";
import { SearchResultItem } from "@/hooks/useSearch";

interface SearchLayoutProps {
  title: string;
  description?: string;
  searchArea?: ReactNode;
  results: SearchResultItem[];
  loading: boolean;
  totalCount: number;
  page: number;
  itemsPerPage: number;
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onPageChange: (page: number) => void;
  searchQuery?: string;
}

const SearchLayout = ({
  title,
  description,
  searchArea,
  results,
  loading,
  totalCount,
  page,
  itemsPerPage,
  filters,
  onFilterChange,
  onPageChange,
  searchQuery
}: SearchLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {searchArea && (
          <div className="mb-6">
            {searchArea}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <SearchFilters
              selectedCategory={filters.category}
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              sortBy={filters.sortBy}
              onFilterChange={onFilterChange}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {loading ? "Loading..." : `${totalCount} ${searchQuery ? "results found" : "items available"}`}
                {searchQuery && ` for "${searchQuery}"`}
              </h2>
            </div>
            <Separator className="mb-6" />
            <SearchResults 
              results={results} 
              loading={loading}
              page={page}
              totalCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchLayout;
