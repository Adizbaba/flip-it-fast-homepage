import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, DollarSign, Users, Wifi, WifiOff } from "lucide-react";
import { useBidding } from "@/hooks/useBidding";
import { useAuth } from "@/lib/auth";
import BidHistory from "./BidHistory";

interface BiddingSectionProps {
  auctionItemId: string;
}

const BiddingSection = ({ auctionItemId }: BiddingSectionProps) => {
  const { user } = useAuth();
  const {
    auctionItem,
    bids,
    isLoading,
    isConnected,
    placeBid,
    isPlacingBid,
    getCurrentBid,
    getMinimumBid,
    canBid,
    isUserHighestBidder,
  } = useBidding(auctionItemId);

  const [bidAmount, setBidAmount] = useState<number | "">("");

  // Update minimum bid amount when auction item changes
  useEffect(() => {
    if (auctionItem) {
      setBidAmount(getMinimumBid());
    }
  }, [auctionItem, getMinimumBid]);

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

  const handlePlaceBid = () => {
    if (typeof bidAmount === 'number' && bidAmount >= getMinimumBid()) {
      placeBid(bidAmount);
    }
  };

  if (isLoading || !auctionItem) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isAuctionEnded = new Date(auctionItem.end_date) <= new Date();
  const currentBid = getCurrentBid();
  const minimumBid = getMinimumBid();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Current Auction Status
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {isAuctionEnded ? (
                <Badge variant="destructive">Ended</Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {getTimeRemaining(auctionItem.end_date)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Bid Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(currentBid)}
              </p>
              {isUserHighestBidder() && (
                <Badge variant="default" className="mt-1 text-xs">
                  You're the highest bidder!
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Bids</p>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-lg font-semibold">{auctionItem.bid_count}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Bidding Form */}
          {canBid() && !isAuctionEnded && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Minimum bid: {formatPrice(minimumBid)}
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={minimumBid}
                    step={auctionItem.bid_increment}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value ? parseFloat(e.target.value) : "")}
                    placeholder={`Enter at least ${formatPrice(minimumBid)}`}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handlePlaceBid}
                    disabled={isPlacingBid || typeof bidAmount !== 'number' || bidAmount < minimumBid}
                    className="min-w-[100px]"
                  >
                    {isPlacingBid ? (
                      <>
                        <span className="animate-spin mr-2">⭘</span>
                        Bidding...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-1" />
                        Place Bid
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {!user && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Please sign in to place a bid
              </p>
            </div>
          )}

          {user && user.id === auctionItem.seller_id && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                You cannot bid on your own auction
              </p>
            </div>
          )}

          {isAuctionEnded && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                This auction has ended
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bid History */}
      <Card>
        <CardContent className="pt-6">
          <BidHistory 
            bids={bids} 
            currentUserId={user?.id} 
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BiddingSection;