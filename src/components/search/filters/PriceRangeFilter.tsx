
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
}

const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange
}: PriceRangeFilterProps) => {
  const [sliderValue, setSliderValue] = useState<number[]>([
    parseInt(minPrice) || 0, 
    parseInt(maxPrice) || 1000
  ]);

  // Update slider when min/max price props change
  useEffect(() => {
    setSliderValue([
      parseInt(minPrice) || 0,
      parseInt(maxPrice) || 1000
    ]);
  }, [minPrice, maxPrice]);

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    setSliderValue(values);
    onMinPriceChange(values[0].toString());
    onMaxPriceChange(values[1].toString());
  };

  return (
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
          <Label htmlFor="minPrice" className="text-xs">Min (₦)</Label>
          <Input
            id="minPrice"
            type="number"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="maxPrice" className="text-xs">Max (₦)</Label>
          <Input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
