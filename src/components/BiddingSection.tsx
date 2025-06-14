
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBidding, Bid } from '@/hooks/useBidding';
import { useAuth } from '@/lib/auth';
import { DollarSign, Clock, Users } from 'lucide-react';

interface BiddingSectionProps {
  itemId: string;
  currentBid: number;
  startingBid: number;
  endDate: Date;
  sellerId: string;
}

const BiddingSection = ({ itemId, currentBid, startingBid, endDate, sellerId }: BiddingSectionProps) => {
  const { user } = useAuth();
  const { placeBid, getBids, loading } = useBidding();
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const fetchBids = async () => {
      const bidData = await getBids(itemId);
      setBids(bidData);
    };
    fetchBids();
  }, [itemId, getBids]);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setTimeRemaining(`${minutes}m`);
        }
      } else {
        setTimeRemaining('Auction ended');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate]);

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    const success = await placeBid(itemId, amount);
    if (success) {
      setBidAmount('');
      // Refresh bids
      const bidData = await getBids(itemId);
      setBids(bidData);
    }
  };

  const isAuctionEnded = new Date(endDate) < new Date();
  const isOwnAuction = user?.id === sellerId;
  const minBidAmount = currentBid + 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Current Bidding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Current Bid</p>
              <p className="text-2xl font-bold">${currentBid.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{timeRemaining}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-sm">{bids.length} bids</span>
              </div>
            </div>
          </div>

          {!isAuctionEnded && !isOwnAuction && user && (
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Min $${minBidAmount}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={minBidAmount}
                step="1"
              />
              <Button 
                onClick={handlePlaceBid}
                disabled={loading || !bidAmount || parseFloat(bidAmount) < minBidAmount}
              >
                {loading ? 'Bidding...' : 'Place Bid'}
              </Button>
            </div>
          )}

          {isAuctionEnded && (
            <Badge variant="secondary" className="w-full justify-center">
              Auction Ended
            </Badge>
          )}

          {isOwnAuction && (
            <Badge variant="outline" className="w-full justify-center">
              This is your auction
            </Badge>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please sign in to place bids
            </p>
          )}
        </CardContent>
      </Card>

      {bids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {bids.slice(0, 5).map((bid, index) => (
                <div key={bid.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                  <span className="font-medium">${bid.amount.toLocaleString()}</span>
                  <div className="text-right">
                    <p className="text-sm">{bid.profiles?.username || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(bid.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {index === 0 && (
                    <Badge variant="default" className="ml-2">Highest</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BiddingSection;
