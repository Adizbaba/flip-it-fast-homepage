
import { Heart, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const AuctionCard = ({ id, title, image, currentBid, timeRemaining, bids }: AuctionCardProps) => {
  const { user } = useAuth();
  const { addToSavedItems, removeFromSavedItems, isSaved } = useSavedItems(user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <>
      <div className="auction-card border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="relative">
          <AspectRatio ratio={1/1} className="bg-muted">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105" 
              onClick={() => setModalOpen(true)}
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
            onClick={() => setModalOpen(true)}
          >{title}</h3>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Current Bid</p>
              <p className="font-bold text-lg">${currentBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{bids} bids</p>
              <Button 
                size="sm" 
                className="mt-1"
                onClick={() => setModalOpen(true)}
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
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default AuctionCard;
