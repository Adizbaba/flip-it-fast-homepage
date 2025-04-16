
import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";

interface SearchStateProps {
  initialQuery: string;
  onSearch: (query: string) => void;
}

export const SearchState = ({ initialQuery, onSearch }: SearchStateProps) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    "Watches", "Electronics", "Vintage", "Collectibles", "Jewelry"
  ]);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = (query: string) => {
    if (query && !recentSearches.includes(query)) {
      const updatedSearches = [query, ...recentSearches].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    }
    onSearch(query);
  };

  return (
    <div className="mb-6">
      <SearchBar
        initialQuery={initialQuery}
        recentSearches={recentSearches}
        popularSearches={popularSearches}
        onSearch={handleSearch}
      />
    </div>
  );
};
