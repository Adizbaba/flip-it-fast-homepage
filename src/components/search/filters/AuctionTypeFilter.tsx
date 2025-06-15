
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AuctionTypeFilterProps {
  selectedAuctionType: string;
  onAuctionTypeChange: (value: string) => void;
}

const AuctionTypeFilter = ({ 
  selectedAuctionType, 
  onAuctionTypeChange 
}: AuctionTypeFilterProps) => {
  const auctionTypes = [
    { value: "standard", label: "Standard Auction" },
    { value: "reserve", label: "Reserve Auction" },
    { value: "buy_it_now", label: "Buy It Now" },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="auctionType">Auction Type</Label>
      <Select
        value={selectedAuctionType || "all"}
        onValueChange={onAuctionTypeChange}
      >
        <SelectTrigger id="auctionType">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem> {/* Make sure this isn't an empty string */}
          {auctionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AuctionTypeFilter;
