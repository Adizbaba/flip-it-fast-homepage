import { Badge } from "@/components/ui/badge";
import { Trophy, XCircle, Clock, AlertTriangle } from "lucide-react";

interface AuctionStatusBadgeProps {
  status: string;
  winnerId?: string | null;
  currentUserId?: string | null;
  reserveMet?: boolean | null;
  endDate?: string;
}

const AuctionStatusBadge = ({ 
  status, 
  winnerId, 
  currentUserId, 
  reserveMet,
  endDate 
}: AuctionStatusBadgeProps) => {
  // Check if auction is ending soon (less than 1 hour)
  const isEndingSoon = endDate && status === 'Active' && 
    (new Date(endDate).getTime() - new Date().getTime()) < 60 * 60 * 1000;

  if (status === 'Ended') {
    if (winnerId) {
      if (reserveMet === false) {
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Reserve Not Met
          </Badge>
        );
      } else if (currentUserId === winnerId) {
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <Trophy className="h-3 w-3" />
            You Won!
          </Badge>
        );
      } else {
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Auction Ended
          </Badge>
        );
      }
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          No Bids
        </Badge>
      );
    }
  }

  if (status === 'Active') {
    if (isEndingSoon) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Ending Soon
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="secondary">
      {status}
    </Badge>
  );
};

export default AuctionStatusBadge;