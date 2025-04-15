
import { Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuctionCardProps {
  id: number;
  title: string;
  image: string;
  currentBid: number;
  timeRemaining: string;
  bids: number;
}

const AuctionCard = ({ id, title, image, currentBid, timeRemaining, bids }: AuctionCardProps) => {
  return (
    <div className="auction-card">
      <div className="relative">
        <img src={image} alt={title} className="auction-image" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full"
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4" />
        </Button>
        <div className="absolute bottom-2 left-2">
          <div className="countdown-badge flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{timeRemaining}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-2">{title}</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
            <p className="font-bold text-lg">${currentBid.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{bids} bids</p>
            <Button size="sm" className="mt-1">
              Bid Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
