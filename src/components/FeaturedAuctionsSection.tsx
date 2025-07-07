
import { Clock, User, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFeaturedAuctions } from "@/hooks/useFeaturedAuctions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const FeaturedAuctionsSection = () => {
  const { auctions, loading, error } = useFeaturedAuctions(5); // Fetch 5 items as requested
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeLeft = end.getTime() - now.getTime();
    
    if (timeLeft <= 0) return "Ended";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getItemImage = (images: any): string => {
    if (!images) return "/placeholder.svg";
    
    try {
      if (Array.isArray(images) && images.length > 0) {
        return typeof images[0] === 'string' ? images[0] : "/placeholder.svg";
      }
      
      if (typeof images === 'string') {
        return images;
      }
      
      if (typeof images === 'object' && images !== null && 'url' in images) {
        return String(images.url);
      }
    } catch (e) {
      console.error("Error processing image:", e);
    }
    
    return "/placeholder.svg";
  };

  const isNewListing = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Items created within 7 days are considered "New"
  };

  const AuctionCard = ({ auction }: { auction: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <AspectRatio ratio={1/1} className="bg-muted">
          <img 
            src={getItemImage(auction.images)} 
            alt={auction.title || "Auction item"} 
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105" 
            onClick={() => setSelectedItemId(auction.id)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.onerror = null;
            }}
          />
        </AspectRatio>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNewListing(auction.created_at) && (
            <Badge variant="destructive" className="text-xs font-medium">
              New
            </Badge>
          )}
        </div>
        
        {/* Countdown Timer */}
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
            <Clock className="h-3 w-3" />
            <span>{getTimeRemaining(auction.end_date)}</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 
          className="font-semibold text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors leading-tight" 
          onClick={() => setSelectedItemId(auction.id)}
          title={auction.title || "Untitled Item"}
        >
          {auction.title || "Untitled Item"}
        </h3>
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {auction.current_bid ? "Current Bid" : "Starting Bid"}
            </p>
            <p className="font-bold text-lg text-green-600">
              {formatPrice(auction.current_bid || auction.starting_bid)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[60px]">{auction.profiles?.username || "Anonymous"}</span>
            </div>
            {auction.bid_count > 0 && (
              <p className="text-xs text-muted-foreground">{auction.bid_count} bids</p>
            )}
          </div>
        </div>
        
        <Button 
          size="sm" 
          className="w-full group/btn"
          onClick={() => setSelectedItemId(auction.id)}
        >
          <Eye className="h-3 w-3 mr-1 group-hover/btn:scale-110 transition-transform" />
          View Item
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Auctions</h2>
          
          {/* Mobile Carousel Skeleton */}
          <div className="md:hidden">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <Card className="overflow-hidden">
                    <Skeleton className="h-64 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-6 w-1/2 mb-2" />
                      <Skeleton className="h-8 w-full" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop Grid Skeleton */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Auctions</h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Failed to load featured auctions</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (auctions.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Featured Auctions</h2>
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No featured auctions yet
              </h3>
              <p className="text-gray-600 mb-6">
                Be the first to list! Create an auction and showcase your items to thousands of potential buyers.
              </p>
              <Button 
                onClick={() => navigate('/create-listing')}
                className="bg-auction-purple hover:bg-purple-700"
              >
                Create Your First Listing
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center md:text-left">Featured Auctions</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auctions')}
              className="hidden md:flex"
            >
              View All
            </Button>
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {auctions.map((auction) => (
                  <CarouselItem key={auction.id} className="pl-2 md:pl-4 basis-4/5 sm:basis-1/2">
                    <AuctionCard auction={auction} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button 
              variant="outline" 
              onClick={() => navigate('/auctions')}
            >
              View All Auctions
            </Button>
          </div>
        </div>
      </section>

      <ItemDetailModal 
        itemId={selectedItemId}
        isOpen={!!selectedItemId}
        onClose={() => setSelectedItemId(null)}
      />
    </>
  );
};

export default FeaturedAuctionsSection;
