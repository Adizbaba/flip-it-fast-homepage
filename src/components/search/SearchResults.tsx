
import { SearchResultItem } from "@/hooks/useSearch";
import LoadingState from "./results/LoadingState";
import EmptyState from "./results/EmptyState";
import ResultsGrid from "./results/ResultsGrid";
import PaginationControl from "./results/PaginationControl";
import { Badge } from "@/components/ui/badge";

interface SearchResultsProps {
  results: SearchResultItem[];
  loading: boolean;
  page: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const SearchResults = ({
  results,
  loading,
  page,
  totalCount,
  itemsPerPage,
  onPageChange,
}: SearchResultsProps) => {
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  if (loading && results.length === 0) {
    return <LoadingState count={itemsPerPage} />;
  }

  if (results.length === 0) {
    return <EmptyState />;
  }

  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalCount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{startItem}</span> to{" "}
          <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalCount}</span> results
        </p>
        {loading && <Badge variant="outline" className="bg-muted/50">Updating...</Badge>}
      </div>
      
      <ResultsGrid results={results} />
      
      <PaginationControl 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
};

export default SearchResults;
