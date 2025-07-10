
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface PayNowButtonProps {
  auctionId: string;
  isWinner: boolean;
  auctionEnded: boolean;
  paymentCompleted?: boolean;
  className?: string;
  size?: "default" | "sm" | "lg";
}

const PayNowButton = ({
  auctionId,
  isWinner,
  auctionEnded,
  paymentCompleted = false,
  className,
  size = "default"
}: PayNowButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const shouldShowButton = user && isWinner && auctionEnded && !paymentCompleted;

  if (!shouldShowButton) {
    return null;
  }

  const handlePayNow = () => {
    setLoading(true);
    navigate(`/auction-payment?auctionId=${auctionId}`);
  };

  return (
    <Button
      onClick={handlePayNow}
      disabled={loading}
      className={className}
      size={size}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Now
        </>
      )}
    </Button>
  );
};

export default PayNowButton;
