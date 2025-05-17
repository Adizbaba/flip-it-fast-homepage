
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { ItemData, RelatedItemData } from "./types";
import { fetchItemDetails, fetchSimilarItems, fetchSellerItems } from "./utils";
import ItemDetailContent from "./ItemDetailContent";
import RelatedItemsGrid from "./RelatedItemsGrid";
import { useItemDetail } from "@/hooks/useItemDetail";

interface ItemDetailModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const navigate = useNavigate();
  
  // Fetch item details using our updated hook
  const { data: item, isLoading: itemLoading, error, refetch } = useItemDetail(itemId);

  // Reset query on modal close to ensure fresh data on next open
  useEffect(() => {
    if (!isOpen && itemId) {
      // Reset when modal closes
      refetch();
    }
  }, [isOpen, itemId, refetch]);

  // Convert hook data to expected ItemData format if it exists
  const itemData = item ? {
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    starting_bid: item.starting_bid || 0,
    buy_now_price: item.buy_now_price || null,
    bid_increment: item.bid_increment || 1,
    images: Array.isArray(item.images) ? item.images : 
           (item.images ? [String(item.images)] : ["/placeholder.svg"]),
    seller_id: item.seller_id,
    condition: item.condition || "",
    end_date: item.end_date || new Date().toISOString(),
    quantity: item.quantity || 1,
    category_id: item.category_id,
    profiles: item.profiles || null
  } as ItemData : null;

  // Fetch similar items
  const { data: similarItems = [] } = useQuery({
    queryKey: ["similarItems", itemId, item?.category_id],
    queryFn: () => (itemId && item?.category_id ? fetchSimilarItems(supabase, itemId, item.category_id) : []),
    enabled: !!itemId && !!item?.category_id && isOpen,
  });

  // Fetch seller's other items
  const { data: sellerItems = [] } = useQuery({
    queryKey: ["sellerItems", item?.seller_id, itemId],
    queryFn: () => (itemId && item?.seller_id ? fetchSellerItems(supabase, item.seller_id, itemId) : []),
    enabled: !!itemId && !!item?.seller_id && isOpen,
  });

  const handleViewItem = (id: string) => {
    onClose();
    navigate(`/item/${id}`);
  };

  // Define time remaining logic (if item exists)
  const timeRemaining = itemData ? new Date(itemData.end_date).getTime() - Date.now() : 0;
  const isEnded = timeRemaining <= 0;

  // Handle errors for debugging
  if (error) {
    console.error("Modal item detail error:", error);
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {itemLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <DialogHeader>
              <DialogTitle>Error Loading Item</DialogTitle>
              <DialogDescription>
                We couldn't load the item details. Please try again later.
              </DialogDescription>
            </DialogHeader>
            <p className="text-red-500 mt-4">Unable to retrieve item information</p>
          </div>
        ) : itemData ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{itemData.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{itemData.condition}</Badge>
                  {isEnded ? (
                    <Badge variant="destructive">Auction Ended</Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" /> Ends Soon
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </DialogHeader>

            <ItemDetailContent item={itemData} onClose={onClose} />

            <Separator className="my-4" />

            {/* Similar Items */}
            {similarItems.length > 0 && (
              <RelatedItemsGrid 
                title="Similar Items"
                items={similarItems}
                onItemClick={handleViewItem}
              />
            )}

            {/* Seller's Other Items */}
            {sellerItems.length > 0 && (
              <RelatedItemsGrid 
                title="More from this seller"
                items={sellerItems}
                onItemClick={handleViewItem}
              />
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <DialogHeader>
              <DialogTitle>Item Not Found</DialogTitle>
              <DialogDescription>
                The item you're looking for couldn't be found.
              </DialogDescription>
            </DialogHeader>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ItemDetailModal;
