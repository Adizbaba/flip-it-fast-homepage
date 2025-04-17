
import { SearchResultItem } from "@/hooks/useSearch";
import LoadingState from "./results/LoadingState";
import EmptyState from "./results/EmptyState";
import ResultsGrid from "./results/ResultsGrid";
import PaginationControl from "./results/PaginationControl";

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

  if (loading) {
    return <LoadingState count={itemsPerPage} />;
  }

  if (results.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
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
