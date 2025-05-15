
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

  // Ensure images is an array and get the first one or use placeholder
  const itemImage = item.images && item.images.length > 0
    ? item.images[0]
    : "/placeholder.svg";

  // Toggle saved status
  const toggleSaved = (itemId: string) => {
    if (isSaved(itemId)) {
      removeFromSavedItems(itemId);
    } else {
      addToSavedItems(itemId);
    }
  };

  return (
    <>
      <Card key={item.id} className="overflow-hidden h-full">
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={() => setModalOpen(true)}
        >
          <AspectRatio ratio={1/1} className="bg-muted">
            <img
              src={itemImage}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
            onClick={() => setModalOpen(true)}
          >{item.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 h-10">
            {item.description}
          </p>
          <div className="mt-2 flex justify-between items-center">
            <span className="font-bold">${item.starting_bid}</span>
            <span className="text-sm text-muted-foreground">
              {item.profiles?.username || "Unknown seller"}
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={() => setModalOpen(true)}
          >
            View Item
          </Button>
        </CardContent>
      </Card>
      
      <ItemDetailModal 
        itemId={modalOpen ? item.id : null} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </>
  );
};

export default ResultItem;
