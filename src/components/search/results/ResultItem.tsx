
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

  return (
    <>
      <Card key={item.id} className="overflow-hidden h-full">
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={handleOpenModal}
        >
          <AspectRatio ratio={1/1} className="bg-muted">
            <img
              src={itemImage}
              alt={item.title || "Auction item"}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.onerror = null; // Prevent infinite error loop
              }}
            />
          </AspectRatio>
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
          <h3 
            className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
            onClick={handleOpenModal}
          >{item.title || "Untitled Item"}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {item.description || "No description available"}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="font-bold">${item.starting_bid || item.price || 0}</span>
            <span className="text-sm text-muted-foreground">
              {item.profiles?.username || "Unknown seller"}
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={handleOpenModal}
          >
            View Item
          </Button>
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
