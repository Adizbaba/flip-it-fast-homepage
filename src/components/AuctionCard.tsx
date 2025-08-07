
import { Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import AddToCartButton from "@/components/AddToCartButton";

interface AuctionCardProps {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  timeRemaining: string;
  bids: number;
  buyNowPrice?: number;
  startingBid?: number;
}

const AuctionCard = ({ id, title, image, currentBid, timeRemaining, bids, buyNowPrice, startingBid }: AuctionCardProps) => {
  const { user } = useAuth();
  const { addToSavedItems, removeFromSavedItems, isSaved } = useSavedItems(user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Make sure we have a valid image URL or fall back to placeholder
  const safeImage = image || "/placeholder.svg";

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
      toast.error("Could not update watch list. Please try again.");
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
        </div>
        <div className="p-4">
          <h3 
            className="font-medium text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors" 
            onClick={handleOpenModal}
          >{title || "Untitled Item"}</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
                <p className="font-bold text-lg">₦{currentBid.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{bids} bids</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col space-y-2">
              <Button 
                size="sm" 
                className="w-full"
                onClick={handleOpenModal}
              >
                {buyNowPrice ? "View & Bid" : "Place Bid"}
              </Button>
              
              {buyNowPrice && (
                <AddToCartButton
                  itemId={id}
                  itemType="auction"
                  title={title}
                  price={buyNowPrice}
                  image={image}
                  size="sm"
                  variant="outline"
                  className="w-full"
                />
              )}
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
