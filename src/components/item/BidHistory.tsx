import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { User, Clock } from "lucide-react";
import { Bid } from "@/hooks/useBidding";
import { formatDistanceToNow } from "date-fns";

interface BidHistoryProps {
  bids: Bid[];
  currentUserId?: string;
  isLoading?: boolean;
}

const BidHistory = ({ bids, currentUserId, isLoading }: BidHistoryProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 py-2">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-muted rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-medium text-muted-foreground mb-2">No bids yet</h3>
        <p className="text-sm text-muted-foreground">Be the first to place a bid!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Bid History</h3>
      <ScrollArea className="h-64">
        <div className="space-y-3">
          {bids.map((bid, index) => (
            <div key={bid.id}>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={bid.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {bid.profiles?.username || "Anonymous"}
                      </span>
                      {bid.bidder_id === currentUserId && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      {index === 0 && (
                        <Badge variant="default" className="text-xs">
                          Highest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {formatPrice(bid.bid_amount)}
                  </p>
                </div>
              </div>
              {index < bids.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BidHistory;