
import { Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedAuctions } from "@/hooks/useFeaturedAuctions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const FeaturedAuctionsSection = () => {
  const { auctions, loading, error } = useFeaturedAuctions(8);
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
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
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

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Auctions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
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
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Auctions</h2>
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
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Auctions</h2>
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
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Featured Auctions</h2>
            <Button 
              variant="outline" 
              onClick={() => navigate('/auctions')}
              className="hidden sm:flex"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <Card key={auction.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <AspectRatio ratio={1/1} className="bg-muted">
                    <img 
                      src={getItemImage(auction.images)} 
                      alt={auction.title || "Auction item"} 
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105" 
                      onClick={() => setSelectedItemId(auction.id)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                        target.onerror = null;
                      }}
                    />
                  </AspectRatio>
                  <div className="absolute bottom-2 left-2">
                    <div className="flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeRemaining(auction.end_date)}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 
                    className="font-medium text-sm line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors" 
                    onClick={() => setSelectedItemId(auction.id)}
                  >
                    {auction.title || "Untitled Item"}
                  </h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Starting Bid</p>
                      <p className="font-bold text-lg text-green-600">
                        {formatPrice(auction.starting_bid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <User className="h-3 w-3" />
                        <span>{auction.profiles?.username || "Anonymous"}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-1"
                        onClick={() => setSelectedItemId(auction.id)}
                      >
                        View Item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
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
