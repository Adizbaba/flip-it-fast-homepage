
import { Button } from "@/components/ui/button";
import { useFeaturedAuctions } from "@/hooks/useFeaturedAuctions";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ItemDetailModal } from "@/components/item/ItemDetailModal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AuctionCard } from "./featured-auctions/AuctionCard";
import { LoadingSkeleton } from "./featured-auctions/LoadingSkeleton";
import { EmptyState } from "./featured-auctions/EmptyState";

const FeaturedAuctionsSection = () => {
  const { auctions, loading, error } = useFeaturedAuctions(5); // Fetch 5 items as requested
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);


  if (loading) {
    return <LoadingSkeleton />;
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
    return <EmptyState onCreateListing={() => navigate('/create-listing')} />;
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
                    <AuctionCard auction={auction} onViewItem={setSelectedItemId} />
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
              <AuctionCard key={auction.id} auction={auction} onViewItem={setSelectedItemId} />
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
