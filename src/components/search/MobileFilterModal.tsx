
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FilterState } from "./filters/types";
import CategoryFilter from "./filters/CategoryFilter";
import ConditionFilter from "./filters/ConditionFilter";
import PriceRangeFilter from "./filters/PriceRangeFilter";
import SortOptions from "./filters/SortOptions";
import FilterActions from "./filters/FilterActions";
import AuctionTypeFilter from "./filters/AuctionTypeFilter";
import { useState, useEffect } from "react";

interface MobileFilterModalProps {
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition?: string;
  auctionType?: string;
  onFilterChange: (filters: FilterState) => void;
}

const MobileFilterModal = ({
  selectedCategory,
  minPrice,
  maxPrice,
  sortBy,
  condition = "all",
  auctionType = "all",
  onFilterChange,
}: MobileFilterModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>({
    category: selectedCategory || "all",
    minPrice: minPrice || "",
    maxPrice: maxPrice || "",
    sortBy: sortBy || "newest",
    condition: condition || "all",
    auctionType: auctionType || "all",
  });

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({
      category: selectedCategory || "all",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      sortBy: sortBy || "newest",
      condition: condition || "all",
      auctionType: auctionType || "all",
    });
  }, [selectedCategory, minPrice, maxPrice, sortBy, condition, auctionType]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetState = {
      category: "all",
      minPrice: "",
      maxPrice: "",
      sortBy: "newest",
      condition: "all",
      auctionType: "all",
    };
    setLocalFilters(resetState);
    onFilterChange(resetState);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Results</SheetTitle>
          <SheetDescription>
            Adjust filters to refine your search results
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-6">
          {/* Category Filter */}
          <CategoryFilter 
            selectedCategory={localFilters.category} 
            onCategoryChange={(value) => handleFilterChange("category", value)} 
          />

          {/* Auction Type Filter */}
          <AuctionTypeFilter
            selectedAuctionType={localFilters.auctionType || "all"}
            onAuctionTypeChange={(value) => handleFilterChange("auctionType", value)}
          />

          {/* Condition Filter */}
          <ConditionFilter 
            selectedCondition={localFilters.condition || "all"} 
            onConditionChange={(value) => handleFilterChange("condition", value)} 
          />

          {/* Price Range Filter */}
          <PriceRangeFilter 
            minPrice={localFilters.minPrice}
            maxPrice={localFilters.maxPrice}
            onMinPriceChange={(value) => handleFilterChange("minPrice", value)}
            onMaxPriceChange={(value) => handleFilterChange("maxPrice", value)}
          />

          {/* Sort Options */}
          <SortOptions 
            sortBy={localFilters.sortBy} 
            onSortChange={(value) => handleFilterChange("sortBy", value)} 
          />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={applyFilters} className="w-full">
              Apply Filters
            </Button>
            <Button onClick={resetFilters} variant="outline" className="w-full">
              Reset Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFilterModal;
