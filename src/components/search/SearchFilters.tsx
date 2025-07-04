
import { useState, useEffect, useCallback } from "react";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FilterState } from "./filters/types";
import CategoryFilter from "./filters/CategoryFilter";
import ConditionFilter from "./filters/ConditionFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import SortOptions from "./filters/SortOptions";
import FilterActions from "./filters/FilterActions";
import AuctionTypeFilter from "./filters/AuctionTypeFilter";

interface SearchFiltersProps {
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition?: string;
  auctionType?: string;
  onFilterChange: (filters: FilterState) => void;
}

const SearchFilters = ({
  selectedCategory,
  minPrice,
  maxPrice,
  sortBy,
  condition = "all",
  auctionType = "all",
  onFilterChange,
}: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    category: selectedCategory || "all",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    sortBy: sortBy || "newest",
    condition: condition || "all",
    auctionType: auctionType || "all",
  });

  // Update local state when props change
  useEffect(() => {
    setFilters({
      category: selectedCategory || "all",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      sortBy: sortBy || "newest",
      condition: condition || "all",
      auctionType: auctionType || "all",
    });
  }, [selectedCategory, minPrice, maxPrice, sortBy, condition, auctionType]);

  // Debounced filter change to prevent rapid updates
  const debouncedFilterChange = useCallback(
    debounce((newFilters: FilterState) => {
      onFilterChange(newFilters);
    }, 300),
    [onFilterChange]
  );

  // Handle filter changes with debouncing for price fields
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply immediately for non-price filters, debounce for price filters
    if (key === 'minPrice' || key === 'maxPrice') {
      debouncedFilterChange(newFilters);
    } else {
      onFilterChange(newFilters);
    }
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetState = {
      category: "all",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
      condition: "all",
      auctionType: "all",
    };
    setFilters(resetState);
    onFilterChange(resetState);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={filters.category} 
          onCategoryChange={(value) => handleFilterChange("category", value)} 
        />

        {/* Auction Type Filter */}
        <AuctionTypeFilter
          selectedAuctionType={filters.auctionType || "all"}
          onAuctionTypeChange={(value) => handleFilterChange("auctionType", value)}
        />

        {/* Condition Filter */}
        <ConditionFilter 
          selectedCondition={filters.condition || "all"} 
          onConditionChange={(value) => handleFilterChange("condition", value)} 
        />

        {/* Price Range Filter */}
        <PriceRangeFilter 
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onMinPriceChange={(value) => handleFilterChange("minPrice", value)}
          onMaxPriceChange={(value) => handleFilterChange("maxPrice", value)}
        />

        {/* Sort Options */}
        <SortOptions 
          sortBy={filters.sortBy} 
          onSortChange={(value) => handleFilterChange("sortBy", value)} 
        />

        {/* Action Buttons */}
        <FilterActions 
          onApply={applyFilters} 
          onReset={resetFilters} 
        />
      </CardContent>
    </Card>
  );
};

// Simple debounce function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default SearchFilters;
