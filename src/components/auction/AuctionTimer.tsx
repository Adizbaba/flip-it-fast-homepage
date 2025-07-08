import { useState, useEffect } from "react";
import { Clock, Trophy, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AuctionTimerProps {
  endDate: string;
  status: string;
  winnerId?: string | null;
  currentUserId?: string | null;
  reserveMet?: boolean | null;
  compact?: boolean;
}

const AuctionTimer = ({ 
  endDate, 
  status, 
  winnerId, 
  currentUserId, 
  reserveMet,
  compact = false 
}: AuctionTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    total: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const formatTime = (value: number): string => {
    return value.toString().padStart(2, '0');
  };

  const getStatusDisplay = () => {
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

    if (timeLeft.total <= 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Ending Soon
        </Badge>
      );
    }

    return null;
  };

  const getTimeDisplay = () => {
    if (status === 'Ended' || timeLeft.total <= 0) {
      return null;
    }

    if (compact) {
      if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h`;
      if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m`;
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }

    return (
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        <div className="flex gap-1">
          {timeLeft.days > 0 && (
            <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
              {formatTime(timeLeft.days)}d
            </span>
          )}
          <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
            {formatTime(timeLeft.hours)}h
          </span>
          <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
            {formatTime(timeLeft.minutes)}m
          </span>
          <span className="bg-muted px-2 py-1 rounded text-xs font-mono">
            {formatTime(timeLeft.seconds)}s
          </span>
        </div>
      </div>
    );
  };

  const statusDisplay = getStatusDisplay();
  const timeDisplay = getTimeDisplay();

  if (compact) {
    return (
      <div className="text-xs text-muted-foreground">
        {statusDisplay || timeDisplay}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {statusDisplay && statusDisplay}
      {timeDisplay && timeDisplay}
    </div>
  );
};

export default AuctionTimer;