
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface ItemPricingProps {
  currentBid: number;
  quantity: number;
  buyNowPrice?: number | null;
  itemId: string;
  sellerId: string;
  isEnded: boolean;
  title: string;
  images: string[];
  onClose: () => void;
}

const ItemPricing = ({
  currentBid,
  quantity,
  buyNowPrice,
  itemId,
  sellerId,
  isEnded,
  title,
  images,
  onClose,
}: ItemPricingProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasBuyNowOption = !!buyNowPrice;

  const handleBuyNow = () => {
    if (!user) {
      return;
    }

    navigate(`/checkout?id=${itemId}&type=purchase`);
    onClose();
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-sm text-muted-foreground">Current Bid</p>
          <p className="text-2xl font-bold">${currentBid}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Quantity</p>
          <p className="font-medium">{quantity || 1} available</p>
        </div>
      </div>

      {hasBuyNowOption && user && user.id !== sellerId && !isEnded && (
        <div className="flex gap-2">
          <Button className="flex-1" variant="outline" onClick={handleBuyNow}>
            <ShoppingCart className="h-4 w-4 mr-1" /> Buy Now ${buyNowPrice}
          </Button>
          <AddToCartButton
            itemId={itemId}
            itemType="auction"
            title={title}
            price={buyNowPrice || 0}
            image={images[0]}
            className="flex-1"
          />
        </div>
      )}

      {(!user || user.id === sellerId) && !isEnded && hasBuyNowOption && (
        <div className="text-center py-1">
          {!user ? (
            <p className="text-sm text-muted-foreground">
              Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/auth")}>sign in</Button> to purchase
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">You can't purchase your own listing</p>
          )}
        </div>
      )}

      {isEnded && (
        <div className="text-center py-1">
          <p className="text-sm text-muted-foreground">This auction has ended</p>
        </div>
      )}
    </div>
  );
};

export default ItemPricing;
