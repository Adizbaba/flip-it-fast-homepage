
import { Heart, Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { SearchResultItem } from "@/hooks/useSearch";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ResultItemProps {
  item: SearchResultItem;
}

const ResultItem = ({ item }: ResultItemProps) => {
  const { user } = useAuth();
  const { isSaved, addToSavedItems, removeFromSavedItems } = useSavedItems(user);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Process item images to ensure we have a valid URL
  const getItemImage = (): string => {
    if (!item.images) return "/placeholder.svg";
    
    try {
      // If it's an array
      if (Array.isArray(item.images) && item.images.length > 0) {
        return typeof item.images[0] === 'string' ? item.images[0] : "/placeholder.svg";
      }
      
      // If it's a string
      if (typeof item.images === 'string') {
        return item.images;
      }
      
      // If it's an object with a url property
      if (typeof item.images === 'object' && item.images !== null && 'url' in item.images) {
        return String(item.images.url);
      }
    } catch (e) {
      console.error("Error processing image in ResultItem:", e);
    }
    
    return "/placeholder.svg";
  };

  const itemImage = getItemImage();

  // Toggle saved status
  const toggleSaved = (itemId: string) => {
    if (isSaved(itemId)) {
      removeFromSavedItems(itemId);
    } else {
      addToSavedItems(itemId);
    }
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleViewFullDetails = () => {
    navigate(`/item/${item.id}`);
  };

  // Calculate time remaining
  const timeRemaining = item.endDate ? item.endDate.getTime() - Date.now() : 0;
  const isEnded = timeRemaining <= 0;

  return (
    <>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div 
          className="relative h-48 overflow-hidden cursor-pointer group"
          onClick={handleOpenModal}
        >
          <AspectRatio ratio={1/1} className="bg-muted">
            <img
              src={itemImage}
              alt={item.title || "Auction item"}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.onerror = null;
              }}
            />
          </AspectRatio>
          
          {/* Auction status badge */}
          <div className="absolute top-2 left-2">
            {isEnded ? (
              <Badge variant="destructive">Ended</Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-500 text-white">
                <Clock className="h-3 w-3 mr-1" />
                Live
              </Badge>
            )}
          </div>

          {/* Save button */}
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                toggleSaved(item.id);
              }}
            >
              <Heart
                className={`h-5 w-5 ${
                  isSaved(item.id) ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 
                className="font-semibold truncate cursor-pointer hover:text-primary transition-colors text-lg"
                onClick={handleOpenModal}
              >
                {item.title || "Untitled Item"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {item.description || "No description available"}
              </p>
            </div>

            {/* Price and bid info */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Current Bid</p>
                  <p className="text-xl font-bold text-green-600">
                    ${item.starting_bid || item.price || 0}
                  </p>
                </div>
                {item.auctionType === 'buy_it_now' && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Buy Now</p>
                    <p className="text-lg font-semibold text-blue-600">
                      ${item.highestBid || item.starting_bid || 0}
                    </p>
                  </div>
                )}
              </div>

              {/* Auction type and condition */}
              <div className="flex justify-between items-center text-sm">
                <Badge variant="outline">{item.condition || "Good"}</Badge>
                <span className="text-muted-foreground">
                  {item.profiles?.username || "Unknown seller"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleOpenModal}
              >
                Quick View
              </Button>
              <Button
                className="flex-1"
                onClick={handleViewFullDetails}
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {item.auctionType === 'buy_it_now' ? 'Buy Now' : 'Bid Now'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ItemDetailModal 
        itemId={modalOpen ? item.id : null} 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default ResultItem;
