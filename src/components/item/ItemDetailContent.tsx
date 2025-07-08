
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ItemData } from "./types";
import { useBidding } from "@/hooks/useBidding";
import BiddingSection from "./BiddingSection";
import ItemImageGallery from "./ItemImageGallery";
import ItemPricing from "./ItemPricing";
import ItemInfo from "./ItemInfo";

interface ItemDetailContentProps {
  item: ItemData;
  onClose: () => void;
}

const ItemDetailContent = ({ item, onClose }: ItemDetailContentProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getCurrentBid } = useBidding(item.id);

  // Ensure we have valid images array
  const itemImages = item.images && Array.isArray(item.images) && item.images.length > 0 
    ? item.images 
    : ["/placeholder.svg"];

  const currentBid = getCurrentBid();

  const handleViewFullDetails = () => {
    if (item) {
      navigate(`/item/${item.id}`);
      onClose();
    }
  };

  const timeRemaining = new Date(item.end_date).getTime() - Date.now();
  const isEnded = timeRemaining <= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Item Image */}
      <ItemImageGallery images={itemImages} title={item.title} />

      {/* Item Details */}
      <div className="space-y-4">
        {/* Price and Buy Now Info */}
        <ItemPricing
          currentBid={currentBid}
          quantity={item.quantity}
          buyNowPrice={item.buy_now_price}
          itemId={item.id}
          sellerId={item.seller_id}
          isEnded={isEnded}
          title={item.title}
          images={itemImages}
          onClose={onClose}
        />

        <ItemInfo
          seller={item.profiles}
          description={item.description}
          onViewFullDetails={handleViewFullDetails}
        />
      </div>

      {/* Bidding Section */}
      <div className="md:col-span-2">
        <BiddingSection auctionItemId={item.id} />
      </div>
    </div>
  );
};

export default ItemDetailContent;
