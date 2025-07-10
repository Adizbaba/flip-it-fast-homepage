import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useItemDetail } from "@/hooks/useItemDetail";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import AddToCartButton from "@/components/AddToCartButton";
import { useToast } from "@/components/ui/use-toast";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Clock, DollarSign, User, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import AuctionTimer from "@/components/auction/AuctionTimer";
import { supabase } from "@/integrations/supabase/client";

const ItemDetail = () => {
  const { itemId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useItemDetail(itemId!);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"bid" | "purchase" | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Check if payment is completed for this auction
  useEffect(() => {
    if (user && item && item.winner_id === user.id && item.status === "Ended") {
      const checkPaymentStatus = async () => {
        const { data } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("item_id", item.id)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .single();
        
        setPaymentCompleted(!!data);
      };
      
      checkPaymentStatus();
    }
  }, [user, item]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Item not found</h1>
            <p className="text-muted-foreground">The item you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBid = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place a bid",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentType("bid");
    setDialogOpen(true);
  };
  
  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to make a purchase",
        variant: "destructive",
      });
      return;
    }
    
    setPaymentType("purchase");
    setDialogOpen(true);
  };
  
  const handlePaymentConfirm = () => {
    setDialogOpen(false);
    
    if (paymentType) {
      navigate(`/checkout?id=${item.id}&type=${paymentType}`);
    }
  };

  const timeRemaining = new Date(item.end_date).getTime() - Date.now();
  const isEnded = timeRemaining <= 0;
  const hasBuyNowOption = !!item.buy_now_price;
  const isCurrentUserWinner = user?.id === item.winner_id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <Card className="p-4">
              <Carousel>
                <CarouselContent>
                  {(item.images as string[] || ["/placeholder.svg"]).map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </Card>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{item.title}</h1>
              <p className="text-muted-foreground">Condition: {item.condition}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Bid</p>
                  <p className="text-2xl font-bold">₦{(item.current_bid || item.starting_bid).toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <AuctionTimer 
                    endDate={item.end_date}
                    status={item.status}
                    winnerId={item.winner_id}
                    currentUserId={user?.id}
                    reserveMet={item.reserve_met}
                    auctionId={item.id}
                    paymentCompleted={paymentCompleted}
                  />
                </div>
              </div>

              {/* Show appropriate action buttons */}
              {!isEnded && (
                <div className="flex flex-col space-y-2">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleBid}
                    disabled={user?.id === item.seller_id}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Place Bid
                  </Button>
                  
                  {hasBuyNowOption && (
                    <div className="flex space-x-2 w-full">
                      <Button 
                        className="flex-1" 
                        size="lg"
                        variant="outline"
                        onClick={handleBuyNow}
                        disabled={user?.id === item.seller_id}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Buy Now ₦{item.buy_now_price?.toLocaleString()}
                      </Button>
                      
                      <AddToCartButton 
                        itemId={item.id}
                        itemType="auction"
                        title={item.title}
                        price={item.buy_now_price || item.starting_bid}
                        image={(item.images as string[])?.[0]}
                        className="flex-1"
                        size="lg"
                        disabled={user?.id === item.seller_id}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Show payment status for ended auctions */}
              {isEnded && isCurrentUserWinner && item.reserve_met && (
                <div className="space-y-2">
                  {paymentCompleted ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">✅ Payment Completed</p>
                      <p className="text-green-600 text-sm">Thank you for your payment. The seller will be in touch soon.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 font-medium">🎉 Congratulations! You won this auction</p>
                      <p className="text-blue-600 text-sm mb-3">Complete your payment to secure your item.</p>
                      <PayNowButton
                        auctionId={item.id}
                        isWinner={true}
                        auctionEnded={true}
                        paymentCompleted={paymentCompleted}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              {isEnded && !item.reserve_met && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 font-medium">Reserve Price Not Met</p>
                  <p className="text-orange-600 text-sm">This auction ended without meeting the reserve price.</p>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Item Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Seller Information</h2>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={item.profiles && typeof item.profiles === 'object' ? 
                    (item.profiles as { avatar_url: string | null })?.avatar_url || undefined : undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.profiles && typeof item.profiles === 'object' ? 
                    (item.profiles as { username: string })?.username || "Unknown seller" : "Unknown seller"}</p>
                  <p className="text-sm text-muted-foreground">Member since {new Date(item.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{paymentType === "bid" ? "Place a Bid" : "Complete Purchase"}</DialogTitle>
            <DialogDescription>
              {paymentType === "bid" 
                ? "You're about to place a bid on this item"
                : "You're about to purchase this item at the buy now price"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">Item: {item.title}</p>
            <p className="mt-2">
              Amount: ${paymentType === "bid" ? item.starting_bid : item.buy_now_price}
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentConfirm}>
              {paymentType === "bid" ? "Continue to Bid" : "Continue to Checkout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ItemDetail;
