
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchFilters from "./SearchFilters";
import SearchResults from "./SearchResults";
import { FilterState } from "./filters/types";

interface SearchLayoutProps {
  title: string;
  description?: string;
  results: any[];
  loading: boolean;
  totalCount: number;
  page: number;
  itemsPerPage: number;
  filters: FilterState;
  onFilterChange: (filters: Record<string, string>) => void;
  onPageChange: (page: number) => void;
  searchQuery?: string;
  searchArea?: ReactNode;
  customHeader?: ReactNode;
}

const SearchLayout = ({
  title,
  description,
  results,
  loading,
  totalCount,
  page,
  itemsPerPage,
  filters,
  onFilterChange,
  onPageChange,
  searchQuery,
  searchArea,
  customHeader
}: SearchLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          {customHeader ? (
            <h1 className="text-4xl font-bold mb-4">{customHeader}</h1>
          ) : (
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground text-lg">{description}</p>
          )}
        </div>

        {searchArea && (
          <div className="mb-8">
            {searchArea}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <SearchFilters
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </aside>

          {/* Results */}
          <div className="flex-1">
            <SearchResults
              results={results}
              loading={loading}
              totalCount={totalCount}
              page={page}
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
