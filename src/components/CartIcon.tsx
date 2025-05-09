
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";

const CartIcon = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative"
      onClick={() => navigate("/cart")}
      aria-label="Shopping Cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.25rem] text-xs">
          {totalItems}
        </Badge>
      )}
    </Button>
  );
};

export default CartIcon;
