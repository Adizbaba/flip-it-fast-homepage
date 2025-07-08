
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Info } from "lucide-react";
import { ItemProfile } from "./types";

interface ItemInfoProps {
  seller: ItemProfile | null;
  description: string;
  onViewFullDetails: () => void;
}

const ItemInfo = ({ seller, description, onViewFullDetails }: ItemInfoProps) => {
  return (
    <div className="space-y-4">
      {/* Seller Info */}
      <div>
        <h3 className="font-medium mb-2">Seller</h3>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={seller?.avatar_url || undefined} />
            <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <span>{seller?.username || "Unknown seller"}</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-medium mb-1">Description</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
      </div>

      <Button variant="outline" className="w-full" onClick={onViewFullDetails}>
        <Info className="mr-2 h-4 w-4" /> View Full Details
      </Button>
    </div>
  );
};

export default ItemInfo;
