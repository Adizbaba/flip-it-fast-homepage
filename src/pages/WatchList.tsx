
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

const WatchList = () => {
  const { user } = useAuth();
  const { savedItems, loading } = useSavedItems(user);
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center space-y-4 p-4">
          <h2 className="text-2xl font-bold">Please Sign In</h2>
          <p>You need to be signed in to view your watch list.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Watch List</h1>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="w-full h-6 mb-2" />
                  <div className="flex justify-between">
                    <Skeleton className="w-1/3 h-10" />
                    <Skeleton className="w-1/3 h-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg mb-4">Your watch list is empty.</p>
            <Button onClick={() => navigate('/')}>Explore Auctions</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedItems.map(item => {
              const auctionItem = item.auction_items;
              if (!auctionItem) return null;
              
              return (
                <AuctionCard 
                  key={item.id} 
                  id={item.item_id} 
                  title={auctionItem.title || "Unknown Item"} 
                  image={auctionItem.images?.[0]?.url || "https://picsum.photos/id/1/600/400"} 
                  currentBid={auctionItem.starting_bid} 
                  timeRemaining="Ending soon" 
                  bids={0} 
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchList;
