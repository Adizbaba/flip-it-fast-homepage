
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

interface ItemDetailModalProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ItemDetailModal({ itemId, isOpen, onClose }: ItemDetailModalProps) {
  const navigate = useNavigate();

  // Fetch item details
  const { data: item, isLoading: itemLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => (itemId ? fetchItemDetails(supabase, itemId) : null),
    enabled: !!itemId && isOpen,
  });

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

  const timeRemaining = item ? new Date(item.end_date).getTime() - Date.now() : 0;
  const isEnded = timeRemaining <= 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        {itemLoading ? (
          <div className="flex items-center justify-center h-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : item ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{item.title}</DialogTitle>
              <DialogDescription>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{item.condition}</Badge>
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

            <ItemDetailContent item={item} onClose={onClose} />

            <Separator className="my-4" />

            {/* Similar Items */}
            <RelatedItemsGrid 
              title="Similar Items"
              items={similarItems}
              onItemClick={handleViewItem}
            />

            {/* Seller's Other Items */}
            <RelatedItemsGrid 
              title="More from this seller"
              items={sellerItems}
              onItemClick={handleViewItem}
            />
          </>
        ) : (
          <div className="text-center py-8">
            <p>Item not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ItemDetailModal;
