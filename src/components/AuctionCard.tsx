
import { Heart, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  timeRemaining: string;
  bids: number;
  startingBid?: number;
  buyNowPrice?: number;
  condition?: string;
}

const AuctionCard = ({ 
  id, 
  title, 
  image, 
  currentBid, 
  timeRemaining, 
  bids, 
  startingBid = 0,
  buyNowPrice,
  condition
}: AuctionCardProps) => {
  const { user } = useAuth();
  const { addToSavedItems, removeFromSavedItems, isSaved } = useSavedItems(user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Make sure we have a valid image URL or fall back to placeholder
  const safeImage = image || "/placeholder.svg";

  // Calculate if there's been bidding activity
  const hasBids = currentBid > startingBid;

  const handleWatchlistToggle = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your watch list.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isSaved(id)) {
        await removeFromSavedItems(id);
        toast({
          title: "Removed from Watch List",
          description: `${title} has been removed from your watch list.`
        });
      } else {
        await addToSavedItems(id);
        toast({
          title: "Added to Watch List",
          description: `${title} has been added to your watch list.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update watch list. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      <div className="auction-card border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative">
          <AspectRatio ratio={1/1} className="bg-muted">
            <img 
              src={safeImage} 
              alt={title || "Auction item"} 
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105" 
              onClick={handleOpenModal}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.onerror = null; // Prevent infinite error loop
              }}
            />
          </AspectRatio>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full ${isSaved(id) ? 'text-red-500' : ''}`}
            aria-label={isSaved(id) ? "Remove from watchlist" : "Add to watchlist"}
            onClick={handleWatchlistToggle}
          >
            <Heart className={`h-4 w-4 ${isSaved(id) ? 'fill-red-500' : ''}`} />
          </Button>
          
          <div className="absolute bottom-2 left-2">
            <div className="countdown-badge flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              <Clock className="h-3 w-3" />
              <span>{timeRemaining}</span>
            </div>
          </div>

          {buyNowPrice && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="text-xs">
                Buy Now Available
              </Badge>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 
            className="font-medium text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors" 
            onClick={handleOpenModal}
          >{title || "Untitled Item"}</h3>
          
          {condition && (
            <p className="text-xs text-muted-foreground mb-2">Condition: {condition}</p>
          )}
          
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {hasBids ? 'Current Bid' : 'Starting Bid'}
              </p>
              <p className="font-bold text-lg flex items-center gap-1">
                ${currentBid.toLocaleString()}
                {hasBids && <TrendingUp className="h-3 w-3 text-green-500" />}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{bids} bids</p>
              {buyNowPrice && (
                <p className="text-xs text-blue-600 font-medium">
                  Buy: ${buyNowPrice.toLocaleString()}
                </p>
              )}
              <Button 
                size="sm" 
                className="mt-1"
                onClick={handleOpenModal}
              >
                View Item
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ItemDetailModal 
        itemId={modalOpen ? id : null}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default AuctionCard;
