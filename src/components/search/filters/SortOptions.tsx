
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface SortOptionsProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

const SortOptions = ({ sortBy, onSortChange }: SortOptionsProps) => {
  return (
    <div className="space-y-2">
      <Label>Sort By</Label>
      <RadioGroup
        value={sortBy}
        onValueChange={onSortChange}
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
  );
};

export default SortOptions;
