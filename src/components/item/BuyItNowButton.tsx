import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface BuyItNowButtonProps extends ButtonProps {
  itemId: string;
  itemType: 'auction' | 'declutter';
  price: number;
  quantity?: number;
  disabled?: boolean;
}

const BuyItNowButton = ({
  itemId,
  itemType,
  price,
  quantity = 1,
  disabled = false,
  className,
  ...props
}: BuyItNowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Please sign in to make a purchase");
      navigate("/auth");
      return;
    }

    if (disabled) {
      toast.error("This item is not available for purchase");
      return;
    }

    setLoading(true);
    try {
      // Navigate directly to checkout with the single item
      const searchParams = new URLSearchParams({
        itemId,
        itemType,
        quantity: quantity.toString(),
        buyNow: 'true'
      });
      
      navigate(`/checkout-flow?${searchParams.toString()}`);
    } catch (error) {
      console.error("Error processing buy now:", error);
      toast.error("Failed to process purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleBuyNow}
      disabled={loading || disabled}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
      ) : (
        <ShoppingBag className="mr-2 h-4 w-4" />
      )}
      Buy Now ${price.toLocaleString()}
    </Button>
  );
};

export default BuyItNowButton;