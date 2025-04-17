
import { useState } from "react";
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

interface SearchFiltersProps {
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  onFilterChange: (filters: FilterState) => void;
}

const SearchFilters = ({
  selectedCategory,
  minPrice,
  maxPrice,
  sortBy,
  onFilterChange,
}: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    category: selectedCategory,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sortBy: sortBy || "newest",
    condition: "",
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
  };

  // Reset filters
  const resetFilters = () => {
    const resetState = {
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
      condition: "",
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

        {/* Condition Filter */}
        <ConditionFilter 
          selectedCondition={filters.condition || ""} 
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

export default SearchFilters;

// Export the FilterState type from the new location
export type { FilterState } from "./filters/types";
