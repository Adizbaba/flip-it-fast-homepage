
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

interface SearchBarProps {
  initialQuery: string;
  recentSearches: string[];
  popularSearches: string[];
  onSearch: (query: string) => void;
}

const SearchBar = ({ 
  initialQuery, 
  recentSearches, 
  popularSearches, 
  onSearch 
}: SearchBarProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Update query when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsPopoverOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setIsPopoverOpen(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="search"
                placeholder="Search for items, categories, or sellers..."
                className="pl-10 pr-20 h-12 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsPopoverOpen(true)}
              />
              <Button 
                type="submit" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10"
              >
                Search
              </Button>
            </div>
          </PopoverTrigger>
          
          <PopoverContent 
            className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-y-auto" 
            align="start"
            sideOffset={5}
          >
            {(recentSearches.length > 0 || popularSearches.length > 0) && (
              <div className="p-2">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground px-2 py-1">Recent Searches</h3>
                    <ul>
                      {recentSearches.map((search, index) => (
                        <li key={`recent-${index}`}>
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-md flex items-center"
                            onClick={() => handleSuggestionClick(search)}
                            type="button"
                          >
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            {search}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {popularSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground px-2 py-1">Popular Searches</h3>
                    <ul>
                      {popularSearches.map((search, index) => (
                        <li key={`popular-${index}`}>
                          <button
                            className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-md flex items-center"
                            onClick={() => handleSuggestionClick(search)}
                            type="button"
                          >
                            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                            {search}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </form>
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>Popular:</span>
        {popularSearches.slice(0, 5).map((keyword, index) => (
          <button
            key={index}
            className="hover:underline hover:text-primary"
            onClick={() => handleSuggestionClick(keyword)}
          >
            {keyword}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
