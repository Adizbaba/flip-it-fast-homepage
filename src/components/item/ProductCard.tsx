import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import AddToCartButton from "@/components/AddToCartButton";
import BuyItNowButton from "@/components/item/BuyItNowButton";
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  condition?: string;
  quantity?: number;
  itemType: 'auction' | 'declutter';
  isAuction?: boolean;
  timeRemaining?: string;
  bids?: number;
  currentBid?: number;
  buyNowPrice?: number;
  compact?: boolean;
}

const ProductCard = ({
  id,
  title,
  price,
  image,
  condition,
  quantity = 1,
  itemType,
  isAuction = false,
  timeRemaining,
  bids,
  currentBid,
  buyNowPrice,
  compact = false
}: ProductCardProps) => {
  const { user } = useAuth();
  const { addToSavedItems, removeFromSavedItems, isSaved } = useSavedItems(user);
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const displayPrice = isAuction ? (currentBid || price) : price;
  const canPurchase = !isAuction || !!buyNowPrice;
  const purchasePrice = isAuction ? buyNowPrice || price : price;
  const isOutOfStock = quantity === 0;

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast.error("Please sign in to add items to your watch list");
      return;
    }

    try {
      if (isSaved(id)) {
        await removeFromSavedItems(id);
        toast.success("Removed from watch list");
      } else {
        await addToSavedItems(id);
        toast.success("Added to watch list");
      }
    } catch (error) {
      toast.error("Could not update watch list");
    }
  };

  const handleViewItem = () => {
    navigate(`/item/${id}`);
  };

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative">
        <AspectRatio ratio={compact ? 4/3 : 1/1} className="bg-muted">
          <img 
            src={image || "/placeholder.svg"} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            onClick={handleViewItem}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.onerror = null;
            }}
          />
        </AspectRatio>
        
        {/* Overlay Actions */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            onClick={handleViewItem}
            className="bg-white text-black hover:bg-white/90"
          >
            View Details
          </Button>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`bg-white/80 backdrop-blur-sm hover:bg-white rounded-full ${isSaved(id) ? 'text-red-500' : ''}`}
            onClick={handleWatchlistToggle}
          >
            <Heart className={`h-4 w-4 ${isSaved(id) ? 'fill-red-500' : ''}`} />
          </Button>
        </div>

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {condition && (
            <Badge variant="outline" className="text-xs bg-white/80">
              {condition}
            </Badge>
          )}
        </div>

        {/* Time Remaining for Auctions */}
        {isAuction && timeRemaining && (
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              <Clock className="h-3 w-3" />
              <span>{timeRemaining}</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 
              className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer" 
              onClick={handleViewItem}
            >
              {title}
            </h3>
            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-xs text-muted-foreground">
                  {isAuction ? "Current Bid" : "Price"}
                </p>
                <p className="font-bold text-lg">₦{displayPrice.toLocaleString()}</p>
              </div>
              {isAuction && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{bids || 0} bids</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {canPurchase && !isOutOfStock && (
            <div className="flex flex-col space-y-2">
              {!compact && (
                <BuyItNowButton
                  itemId={id}
                  itemType={itemType}
                  price={purchasePrice}
                  size="sm"
                  className="w-full"
                  disabled={isOutOfStock}
                />
              )}
              <AddToCartButton
                itemId={id}
                itemType={itemType}
                title={title}
                price={purchasePrice}
                image={image}
                size="sm"
                variant={compact ? "default" : "outline"}
                className="w-full"
                disabled={isOutOfStock}
              />
            </div>
          )}

          {!canPurchase && isAuction && (
            <Button
              onClick={handleViewItem}
              size="sm"
              className="w-full"
            >
              Place Bid
            </Button>
          )}

          {isOutOfStock && (
            <Button
              disabled
              size="sm"
              className="w-full"
            >
              Out of Stock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;