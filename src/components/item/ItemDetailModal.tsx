
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import AddToCartButton from "@/components/AddToCartButton";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, DollarSign, User, ShoppingCart, Info, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ItemDetailModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Define stronger types for the item and related items
interface ItemProfile {
  username?: string;
  avatar_url?: string | null;
}

interface ItemData {
  id: string;
  title: string;
  description: string;
  starting_bid: number;
  buy_now_price?: number | null;
  bid_increment?: number;
  images?: string[];
  seller_id: string;
  condition: string;
  end_date: string;
  quantity: number;
  category_id?: string;
  profiles?: ItemProfile | null;
}

interface RelatedItemData {
  id: string;
  title: string;
  description: string;
  starting_bid: number;
  images?: string[];
  profiles?: {
    username?: string;
  } | null;
}

const fetchItem = async (itemId: string) => {
  const { data, error } = await supabase
    .from("auction_items")
    .select(`
      *,
      profiles:seller_id (
        username,
        avatar_url
      )
    `)
    .eq("id", itemId)
    .single();

  if (error) throw error;
  
  // Handle the profiles separately to ensure proper typing
  const itemData: ItemData = {
    ...data,
    profiles: data.profiles as ItemProfile | null,
    images: data.images as string[] || []
  };
  
  return itemData;
};

const fetchSimilarItems = async (itemId: string, categoryId: string) => {
  const { data, error } = await supabase
    .from("auction_items")
    .select(`
      id,
      title,
      description,
      starting_bid,
      images,
      seller_id,
      profiles:seller_id (
        username
      )
    `)
    .eq("category_id", categoryId)
    .neq("id", itemId)
    .limit(5);

  if (error) throw error;
  
  // Map the data to ensure proper typing
  const relatedItems: RelatedItemData[] = data.map(item => ({
    ...item,
    images: item.images as string[] || [],
    profiles: item.profiles as { username?: string } | null
  }));
  
  return relatedItems;
};

const fetchSellerItems = async (sellerId: string, itemId: string) => {
  const { data, error } = await supabase
    .from("auction_items")
    .select(`
      id,
      title,
      description,
      starting_bid,
      images,
      profiles:seller_id (
        username
      )
    `)
    .eq("seller_id", sellerId)
    .neq("id", itemId)
    .limit(5);

  if (error) throw error;
  
  // Map the data to ensure proper typing
  const sellerItems: RelatedItemData[] = data.map(item => ({
    ...item,
    images: item.images as string[] || [],
    profiles: item.profiles as { username?: string } | null
  }));
  
  return sellerItems;
};

export function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState<number | "">("");
  
  // Fetch item details
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => (itemId ? fetchItem(itemId) : null),
    enabled: !!itemId && isOpen,
  });

  // Fetch similar items
  const { data: similarItems = [] } = useQuery({
    queryKey: ["similarItems", itemId, item?.category_id],
    queryFn: () => (itemId && item?.category_id ? fetchSimilarItems(itemId, item.category_id) : []),
    enabled: !!itemId && !!item?.category_id && isOpen,
  });

  // Fetch seller's other items
  const { data: sellerItems = [] } = useQuery({
    queryKey: ["sellerItems", item?.seller_id, itemId],
    queryFn: () => (itemId && item?.seller_id ? fetchSellerItems(item.seller_id, itemId) : []),
    enabled: !!itemId && !!item?.seller_id && isOpen,
  });

  // Reset bid amount when modal closes or item changes
  useEffect(() => {
    if (isOpen && item) {
      // Set initial bid amount based on starting bid and increment
      const startingBid = item.starting_bid;
      const bidIncrement = item.bid_increment || 1;
      setBidAmount(startingBid + bidIncrement);
    } else {
      setBidAmount("");
    }
  }, [isOpen, item]);

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

  const handleViewItem = (id: string) => {
    onClose();
    navigate(`/item/${id}`);
  };

  const timeRemaining = item ? new Date(item.end_date).getTime() - Date.now() : 0;
  const isEnded = timeRemaining <= 0;
  const hasBuyNowOption = item && !!item.buy_now_price;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {itemLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : item ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{item.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{item.condition}</Badge>
                  {isEnded ? (
                    <Badge variant="destructive">Auction Ended</Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" /> Ends Soon
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Image */}
              <div>
                <Carousel>
                  <CarouselContent>
                    {(item.images as string[] || ["/placeholder.svg"]).map((image, index) => (
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
                            price={item.buy_now_price?.toString()}
                            image={(item.images as string[])?.[0]}
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

            <Separator className="my-4" />

            {/* Similar Items */}
            {similarItems.length > 0 && (
              <div className="py-2">
                <h3 className="font-semibold mb-3">Similar Items</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {similarItems.map((similarItem) => (
                    <div 
                      key={similarItem.id}
                      className="border rounded-md p-2 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleViewItem(similarItem.id)}
                    >
                      <img
                        src={(similarItem.images as string[])?.[0] || "/placeholder.svg"}
                        alt={similarItem.title}
                        className="w-full aspect-square object-cover rounded-sm"
                      />
                      <p className="text-sm font-medium mt-1 truncate">{similarItem.title}</p>
                      <p className="text-xs text-muted-foreground">${similarItem.starting_bid}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller's Other Items */}
            {sellerItems.length > 0 && (
              <div className="py-2">
                <h3 className="font-semibold mb-3">More from this seller</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {sellerItems.map((sellerItem) => (
                    <div 
                      key={sellerItem.id}
                      className="border rounded-md p-2 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleViewItem(sellerItem.id)}
                    >
                      <img
                        src={(sellerItem.images as string[])?.[0] || "/placeholder.svg"}
                        alt={sellerItem.title}
                        className="w-full aspect-square object-cover rounded-sm"
                      />
                      <p className="text-sm font-medium mt-1 truncate">{sellerItem.title}</p>
                      <p className="text-xs text-muted-foreground">${sellerItem.starting_bid}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p>Item not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ItemDetailModal;
