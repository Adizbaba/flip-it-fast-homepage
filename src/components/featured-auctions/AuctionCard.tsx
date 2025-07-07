import { Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { formatPrice, getTimeRemaining, getItemImage, isNewListing } from "./utils";

interface AuctionCardProps {
  auction: any;
  onViewItem: (auctionId: string) => void;
}

export const AuctionCard = ({ auction, onViewItem }: AuctionCardProps) => (
  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
    <div className="relative">
      <AspectRatio ratio={1/1} className="bg-muted">
        <img 
          src={getItemImage(auction.images)} 
          alt={auction.title || "Auction item"} 
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105" 
          onClick={() => onViewItem(auction.id)}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder.svg";
            target.onerror = null;
          }}
        />
      </AspectRatio>
      
      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isNewListing(auction.created_at) && (
          <Badge variant="destructive" className="text-xs font-medium">
            New
          </Badge>
        )}
      </div>
      
      {/* Countdown Timer */}
      <div className="absolute bottom-2 right-2">
        <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
          <Clock className="h-3 w-3" />
          <span>{getTimeRemaining(auction.end_date)}</span>
        </div>
      </div>
    </div>
    
    <CardContent className="p-4">
      <h3 
        className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors leading-tight" 
        onClick={() => onViewItem(auction.id)}
        title={auction.title || "Untitled Item"}
      >
        {auction.title || "Untitled Item"}
      </h3>
      
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">
            {auction.current_bid ? "Current Bid" : "Starting Bid"}
          </p>
          <p className="font-bold text-lg text-green-600">
            {formatPrice(auction.current_bid || auction.starting_bid)}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[60px]">{auction.profiles?.username || "Anonymous"}</span>
          </div>
          {auction.bid_count > 0 && (
            <p className="text-xs text-muted-foreground">{auction.bid_count} bids</p>
          )}
        </div>
      </div>
      
      <Button 
        size="sm" 
        className="w-full group/btn"
        onClick={() => onViewItem(auction.id)}
      >
        <Eye className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform" />
        View Item
      </Button>
    </CardContent>
  </Card>
);