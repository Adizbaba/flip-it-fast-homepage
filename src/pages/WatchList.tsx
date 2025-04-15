
import { useAuth } from "@/lib/auth";
import { useSavedItems } from "@/hooks/useSavedItems";
import AuctionCard from "@/components/AuctionCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

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
          <div>Loading...</div>
        ) : savedItems.length === 0 ? (
          <div className="text-center text-gray-500">
            Your watch list is empty. Start exploring auctions!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedItems.map(item => (
              <AuctionCard 
                key={item.id} 
                id={item.item_id} 
                // You'll need to spread the auction item details here
                title="" 
                image="" 
                currentBid={0} 
                timeRemaining="" 
                bids={0} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WatchList;
