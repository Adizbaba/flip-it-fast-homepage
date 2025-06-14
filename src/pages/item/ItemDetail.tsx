
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
import BiddingSection from "@/components/BiddingSection";
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
import { useState } from "react";

const ItemDetail = () => {
  const { itemId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: item, isLoading, error } = useItemDetail(itemId!);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<"bid" | "purchase" | null>(null);

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
  const currentBid = item.highest_bid || item.starting_bid;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4">
              <Carousel>
                <CarouselContent>
                  {(item.images as string[] || ["/placeholder.svg"]).map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square relative">
                        <img
                          src={image}
                          alt={`${item.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </Card>

            {/* Item Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Item Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            </Card>

            {/* Seller Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
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
            </Card>
          </div>

          {/* Bidding and Purchase Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{item.title}</h1>
              <p className="text-muted-foreground">Condition: {item.condition}</p>
            </div>

            <Separator />

            {/* Bidding Section */}
            <BiddingSection
              itemId={item.id}
              currentBid={currentBid}
              startingBid={item.starting_bid}
              endDate={new Date(item.end_date)}
              sellerId={item.seller_id}
            />

            {/* Buy Now Option */}
            {hasBuyNowOption && !isEnded && user?.id !== item.seller_id && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Skip the bidding</p>
                    <p className="text-xl font-bold">${item.buy_now_price}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={handleBuyNow}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Buy Now
                    </Button>
                    
                    <AddToCartButton 
                      itemId={item.id}
                      itemType="auction"
                      title={item.title}
                      price={item.buy_now_price}
                      image={(item.images as string[])?.[0]}
                      className="flex-1"
                      size="lg"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              You're about to purchase this item at the buy now price
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">Item: {item.title}</p>
            <p className="mt-2">
              Amount: ${item.buy_now_price}
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentConfirm}>
              Continue to Checkout
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default ItemDetail;
