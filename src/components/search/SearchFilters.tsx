
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tables } from "@/integrations/supabase/types";

interface Category {
  id: string;
  name: string;
}

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    category: selectedCategory,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sortBy: sortBy || "newest",
  });
  const [sliderValue, setSliderValue] = useState<number[]>([
    parseInt(minPrice) || 0, 
    parseInt(maxPrice) || 1000
  ]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle price slider change
  const handleSliderChange = (values: number[]) => {
    setSliderValue(values);
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    }));
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
    };
    setFilters(resetState);
    setSliderValue([0, 1000]);
    onFilterChange(resetState);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-4">
          <Label>Price Range</Label>
          <Slider
            value={sliderValue}
            max={10000}
            step={10}
            onValueChange={handleSliderChange}
          />
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="minPrice" className="text-xs">Min ($)</Label>
              <Input
                id="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="grid flex-1 gap-2">
              <Label htmlFor="maxPrice" className="text-xs">Max ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <RadioGroup
            value={filters.sortBy}
            onValueChange={(value) => handleFilterChange("sortBy", value)}
            className="space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" />
              <Label htmlFor="newest" className="cursor-pointer text-sm">Newest First</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="priceAsc" id="priceAsc" />
              <Label htmlFor="priceAsc" className="cursor-pointer text-sm">Price: Low to High</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="priceDesc" id="priceDesc" />
              <Label htmlFor="priceDesc" className="cursor-pointer text-sm">Price: High to Low</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="endingSoon" id="endingSoon" />
              <Label htmlFor="endingSoon" className="cursor-pointer text-sm">Ending Soon</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Button onClick={applyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button
            onClick={resetFilters}
            variant="outline"
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
