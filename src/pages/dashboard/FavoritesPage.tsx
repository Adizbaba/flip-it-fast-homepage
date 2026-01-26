
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, ExternalLink, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatNGNSimple } from "@/utils/currency";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const FavoritesPage = () => {
  const { user } = useAuth();
  const { savedItems, loading, removeFromSavedItems } = useSavedItems(user);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeFromSavedItems(itemId);
      toast.success("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: any) => {
    if (!item.auction_items?.buy_now_price) {
      toast.error("This item doesn't have a Buy Now price");
      return;
    }
    
    await addToCart({
      itemId: item.item_id,
      itemType: "auction",
      title: item.auction_items.title,
      price: item.auction_items.buy_now_price,
      image: item.auction_items.images?.[0]?.url || "/placeholder.svg",
      quantity: 1,
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            My Wishlist
          </h1>
          <p className="text-muted-foreground">
            {savedItems.length} {savedItems.length === 1 ? "item" : "items"} saved
          </p>
        </div>
      </div>

      {savedItems.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your wishlist is empty</h3>
              <p className="text-muted-foreground mt-1">
                Save items you're interested in by clicking the heart icon
              </p>
            </div>
            <Button onClick={() => navigate("/")}>
              Browse Auctions
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedItems.map((item) => {
            const auctionItem = item.auction_items;
            if (!auctionItem) return null;

            const imageUrl = auctionItem.images?.[0]?.url || "/placeholder.svg";
            const isEnded = auctionItem.status === "Ended";
            const timeRemaining = getTimeRemaining(auctionItem.end_date);

            return (
              <Card 
                key={item.id} 
                className={`overflow-hidden group ${isEnded ? "opacity-75" : ""}`}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={auctionItem.title}
                    className="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={() => navigate(`/item/${item.item_id}`)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant={isEnded ? "secondary" : "default"}>
                      {auctionItem.status}
                    </Badge>
                    {auctionItem.condition && (
                      <Badge variant="outline" className="bg-white/80">
                        {auctionItem.condition}
                      </Badge>
                    )}
                  </div>
                  {!isEnded && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="bg-black/60 text-white border-0">
                        <Clock className="h-3 w-3 mr-1" />
                        {timeRemaining}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <h3 
                    className="font-semibold line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                    onClick={() => navigate(`/item/${item.item_id}`)}
                  >
                    {auctionItem.title}
                  </h3>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Bid</span>
                      <span className="font-bold">
                        {formatNGNSimple(auctionItem.current_bid || auctionItem.starting_bid)}
                      </span>
                    </div>
                    {auctionItem.buy_now_price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Buy Now</span>
                        <span className="font-semibold text-primary">
                          {formatNGNSimple(auctionItem.buy_now_price)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/item/${item.item_id}`)}
                      disabled={isEnded}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {isEnded ? "View Details" : "View & Bid"}
                    </Button>
                    
                    {auctionItem.buy_now_price && !isEnded && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={removingId === item.item_id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove from Wishlist?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove "{auctionItem.title}" from your wishlist?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemove(item.item_id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
