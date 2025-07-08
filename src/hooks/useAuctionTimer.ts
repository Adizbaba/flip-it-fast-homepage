import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuctionTimerState {
  timeRemaining: number;
  isExpired: boolean;
  isEnding: boolean; // Less than 1 hour remaining
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useAuctionTimer = (endDate: string, status: string) => {
  const [timerState, setTimerState] = useState<AuctionTimerState>({
    timeRemaining: 0,
    isExpired: false,
    isEnding: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const calculateTimeRemaining = useCallback(() => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0 || status === 'Ended') {
      return {
        timeRemaining: 0,
        isExpired: true,
        isEnding: false,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return {
      timeRemaining: difference,
      isExpired: false,
      isEnding: difference < 60 * 60 * 1000, // Less than 1 hour
      days,
      hours,
      minutes,
      seconds,
    };
  }, [endDate, status]);

  useEffect(() => {
    // Calculate immediately
    setTimerState(calculateTimeRemaining());

    // Update every second
    const interval = setInterval(() => {
      const newState = calculateTimeRemaining();
      setTimerState(newState);

      // If auction just expired, trigger a check for auction ending
      if (newState.isExpired && !timerState.isExpired) {
        // Trigger auction processing (this would typically be handled by the server)
        console.log('Auction expired, should trigger server-side processing');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeRemaining, timerState.isExpired]);

  const formatTime = (compact: boolean = false) => {
    if (timerState.isExpired) return "Ended";

    if (compact) {
      if (timerState.days > 0) return `${timerState.days}d ${timerState.hours}h`;
      if (timerState.hours > 0) return `${timerState.hours}h ${timerState.minutes}m`;
      return `${timerState.minutes}m ${timerState.seconds}s`;
    }

    const parts = [];
    if (timerState.days > 0) parts.push(`${timerState.days}d`);
    parts.push(`${timerState.hours.toString().padStart(2, '0')}h`);
    parts.push(`${timerState.minutes.toString().padStart(2, '0')}m`);
    parts.push(`${timerState.seconds.toString().padStart(2, '0')}s`);
    return parts.join(' ');
  };

  return {
    ...timerState,
    formatTime,
  };
};