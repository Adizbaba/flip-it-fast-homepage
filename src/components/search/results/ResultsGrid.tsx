
import ResultItem from "./ResultItem";
import { SearchResultItem } from "@/hooks/useSearch";

interface ResultsGridProps {
  results: SearchResultItem[];
}

const ResultsGrid = ({ results }: ResultsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((item) => (
        <ResultItem key={item.id} item={item} />
      ))}
    </div>
  );
};

export default ResultsGrid;
