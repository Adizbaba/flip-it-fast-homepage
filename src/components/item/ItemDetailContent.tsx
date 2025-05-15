
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, DollarSign, User, ShoppingCart, Info } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ItemData } from "./types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ItemDetailContentProps {
  item: ItemData;
  onClose: () => void;
}

const ItemDetailContent = ({ item, onClose }: ItemDetailContentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState<number | "">("");
  
  // Reset bid amount when item changes
  useEffect(() => {
    if (item) {
      // Set initial bid amount based on starting bid and increment
      const startingBid = item.starting_bid;
      const bidIncrement = item.bid_increment || 1;
      setBidAmount(startingBid + bidIncrement);
    } else {
      setBidAmount("");
    }
  }, [item]);

  const handlePlaceBid = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }

    if (bidAmount && item) {
      // Compare bid amount with starting bid
      if (typeof bidAmount === 'number' && bidAmount < item.starting_bid) {
        toast({
          title: "Invalid bid",
          description: "Your bid must be at least the starting bid amount",
          variant: "destructive",
        });
        return;
      }

      // In a real app, you would make an API call to place the bid
      toast({
        title: "Bid placed successfully",
        description: `You have placed a bid of $${bidAmount} on ${item.title}`,
      });
      onClose();
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to buy this item",
        variant: "destructive",
      });
      return;
    }

    if (item) {
      navigate(`/checkout?id=${item.id}&type=purchase`);
      onClose();
    }
  };

  const handleViewFullDetails = () => {
    if (item) {
      navigate(`/item/${item.id}`);
      onClose();
    }
  };

  const timeRemaining = new Date(item.end_date).getTime() - Date.now();
  const isEnded = timeRemaining <= 0;
  const hasBuyNowOption = !!item.buy_now_price;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Item Image */}
      <div>
        <Carousel>
          <CarouselContent>
            {(item.images && item.images.length > 0 ? item.images : ["/placeholder.svg"]).map((image, index) => (
              <CarouselItem key={index}>
                <div className="overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={`${item.title} - Image ${index + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Item Details */}
      <div className="space-y-4">
        {/* Price and Bid */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Bid</p>
              <p className="text-2xl font-bold">${item.starting_bid}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{item.quantity} available</p>
            </div>
          </div>

          {user && user.id !== item.seller_id && !isEnded && (
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min={item.starting_bid + (item.bid_increment || 1)}
                  step={item.bid_increment || 1}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="Enter bid amount"
                  className="flex-1"
                />
                <Button onClick={handlePlaceBid}>
                  <DollarSign className="h-4 w-4 mr-1" /> Bid
                </Button>
              </div>

              {hasBuyNowOption && (
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={handleBuyNow}>
                    <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now ${item.buy_now_price}
                  </Button>
                  <AddToCartButton
                    itemId={item.id}
                    itemType="auction"
                    title={item.title}
                    price={item.buy_now_price || 0}
                    image={item.images[0] || "/placeholder.svg"}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          )}

          {(!user || user.id === item.seller_id) && !isEnded && (
            <div className="text-center py-1">
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>sign in</Button> to bid or purchase
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">You can't bid on your own listing</p>
              )}
            </div>
          )}

          {isEnded && (
            <div className="text-center py-1">
              <p className="text-sm text-muted-foreground">This auction has ended</p>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div>
          <h3 className="font-medium mb-2">Seller</h3>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={item.profiles?.avatar_url || undefined} />
              <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <span>{item.profiles?.username || "Unknown seller"}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-medium mb-1">Description</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
        </div>

        <Button variant="outline" className="w-full" onClick={handleViewFullDetails}>
          <Info className="mr-2 h-4 w-4" /> View Full Details
        </Button>
      </div>
    </div>
  );
};

export default ItemDetailContent;
