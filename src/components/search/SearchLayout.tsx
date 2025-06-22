
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import MobileFilterModal from "@/components/search/MobileFilterModal";
import { Separator } from "@/components/ui/separator";
import { FilterState } from "@/components/search/filters/types";
import { SearchResultItem } from "@/hooks/useSearch";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchLayoutProps {
  title: string | ReactNode;
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
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          {typeof title === 'string' ? (
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
          ) : (
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
          )}
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
          {/* Desktop Filters */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold mb-4">Filters</h2>
              <SearchFilters
                selectedCategory={filters.category}
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                sortBy={filters.sortBy}
                condition={filters.condition}
                auctionType={filters.auctionType}
                onFilterChange={onFilterChange}
              />
            </div>
          )}
          
          <div className={`${isMobile ? 'col-span-1' : 'lg:col-span-3'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {loading ? "Loading..." : `${totalCount} ${searchQuery ? "results found" : "items available"}`}
                {searchQuery && ` for "${searchQuery}"`}
              </h2>
              
              {/* Mobile Filter Button */}
              {isMobile && (
                <MobileFilterModal
                  selectedCategory={filters.category}
                  minPrice={filters.minPrice}
                  maxPrice={filters.maxPrice}
                  sortBy={filters.sortBy}
                  condition={filters.condition}
                  auctionType={filters.auctionType}
                  onFilterChange={onFilterChange}
                />
              )}
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
