
import { useState } from 'react';
import AuctionCard from './AuctionCard';
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface AuctionSectionProps {
  title: string;
  auctions: Array<{
    id: number;
    title: string;
    image: string;
    currentBid: number;
    timeRemaining: string;
    bids: number;
  }>;
}

const AuctionSection = ({ title, auctions }: AuctionSectionProps) => {
  const [filter, setFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All' },
    { id: 'ending', name: 'Ending Soon' },
    { id: 'popular', name: 'Popular' },
    { id: 'new', name: 'New' },
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button 
                key={item.id}
                variant={filter === item.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {auctions.map((auction) => (
            <AuctionCard 
              key={auction.id} 
              id={auction.id.toString()} 
              title={auction.title} 
              image={auction.image} 
              currentBid={auction.currentBid} 
              timeRemaining={auction.timeRemaining} 
              bids={auction.bids} 
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="gap-1">
            View All Auctions
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuctionSection;
