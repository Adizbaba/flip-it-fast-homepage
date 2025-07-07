
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
import { useBidding } from "@/hooks/useBidding";
import BiddingSection from "./BiddingSection";
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
  const { getCurrentBid } = useBidding(item.id);

  // Ensure we have valid images array
  const itemImages = item.images && Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : ["/placeholder.svg"];

  const currentBid = getCurrentBid();

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
            {itemImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="overflow-hidden rounded-md">
                  <img
                    src={image}
                    alt={`${item.title} - Image ${index + 1}`}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.onerror = null; // Prevent infinite error loop
                    }}
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
        {/* Price and Buy Now Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Bid</p>
              <p className="text-2xl font-bold">${currentBid}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{item.quantity || 1} available</p>
            </div>
          </div>

          {hasBuyNowOption && user && user.id !== item.seller_id && !isEnded && (
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={handleBuyNow}>
                <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now ${item.buy_now_price}
              </Button>
              <AddToCartButton
                itemId={item.id}
                itemType="auction"
                title={item.title}
                price={item.buy_now_price || 0}
                image={itemImages[0]}
                className="flex-1"
              />
            </div>
          )}

          {(!user || user.id === item.seller_id) && !isEnded && hasBuyNowOption && (
            <div className="text-center py-1">
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>sign in</Button> to purchase
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">You can't purchase your own listing</p>
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

      {/* Bidding Section */}
      <div className="md:col-span-2">
        <BiddingSection auctionItemId={item.id} />
      </div>
    </div>
  );
};

export default ItemDetailContent;
