
import { useState, useEffect } from "react";
import { Clock, Trophy, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PayNowButton from "./PayNowButton";

interface AuctionTimerProps {
  endDate: string;
  status: string;
  winnerId?: string | null;
  currentUserId?: string | null;
  reserveMet?: boolean | null;
  auctionId?: string;
  paymentCompleted?: boolean;
  className?: string;
}

const AuctionTimer = ({ 
  endDate, 
  status, 
  winnerId, 
  currentUserId, 
  reserveMet, 
  auctionId,
  paymentCompleted = false,
  className 
}: AuctionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0 || status === "Ended") {
        setIsEnded(true);
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate, status]);

  const isCurrentUserWinner = currentUserId && winnerId === currentUserId;
  const shouldShowPayButton = isCurrentUserWinner && isEnded && reserveMet && auctionId;

  if (isEnded) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2">
          {isCurrentUserWinner ? (
            <>
              <Trophy className="h-4 w-4 text-yellow-500" />
              <Badge variant="default" className="bg-green-100 text-green-800">
                You Won!
              </Badge>
            </>
          ) : reserveMet === false ? (
            <>
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                Reserve Not Met
              </Badge>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary">Auction Ended</Badge>
            </>
          )}
        </div>
        
        {shouldShowPayButton && (
          <PayNowButton
            auctionId={auctionId}
            isWinner={true}
            auctionEnded={true}
            paymentCompleted={paymentCompleted}
            size="sm"
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-4 w-4 text-primary" />
      <Badge variant="outline" className="font-mono">
        {timeLeft}
      </Badge>
    </div>
  );
};

export default AuctionTimer;
