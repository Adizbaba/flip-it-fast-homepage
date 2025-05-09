
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AddToCartButtonProps extends ButtonProps {
  itemId: string;
  itemType: 'auction' | 'declutter';
  title: string;
  price: number;
  image?: string;
  quantity?: number;
}

const AddToCartButton = ({
  itemId,
  itemType,
  title,
  price,
  image,
  quantity = 1,
  className,
  ...props
}: AddToCartButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      await addToCart({
        itemId,
        itemType,
        title,
        price,
        image,
        quantity
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={loading}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
      ) : (
        <ShoppingCart className="mr-2 h-4 w-4" />
      )}
      Add to Cart
    </Button>
  );
};

export default AddToCartButton;
