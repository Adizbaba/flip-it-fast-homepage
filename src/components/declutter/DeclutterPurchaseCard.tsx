
import { useState } from "react";
import { Loader2, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { MessageContactSellerDialog } from "./MessageContactSellerDialog";
import { DeclutterListing } from "@/hooks/useDeclutterListings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface DeclutterPurchaseCardProps {
  listing: DeclutterListing;
}

const DeclutterPurchaseCard = ({ listing }: DeclutterPurchaseCardProps) => {
  const [quantity, setQuantity] = useState(listing.min_purchase_quantity);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isProceedingToCheckout, setIsProceedingToCheckout] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const totalPrice = listing.bulk_price * quantity;

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (
      !isNaN(numValue) && 
      numValue >= listing.min_purchase_quantity && 
      numValue <= listing.quantity
    ) {
      setQuantity(numValue);
    }
  };

  const handleQuantityInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      let validValue = value;
      if (value < listing.min_purchase_quantity) {
        validValue = listing.min_purchase_quantity;
      } else if (value > listing.quantity) {
        validValue = listing.quantity;
      }
      setQuantity(validValue);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      
      // Check if user is authenticated
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to add items to your cart.",
        });
        return;
      }

      // Check if this item is already in the cart
      const { data: existingCartItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("item_id", listing.id)
        .eq("item_type", "declutter")
        .single();

      if (existingCartItem) {
        // Update existing cart item
        const newQuantity = existingCartItem.quantity + quantity;
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: newQuantity })
          .eq("id", existingCartItem.id);

        if (updateError) throw updateError;
      } else {
        // Add new cart item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: userData.user.id,
            item_id: listing.id,
            item_type: "declutter",
            quantity,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to Cart",
        description: `${quantity} ${quantity > 1 ? "items" : "item"} added to your cart.`,
      });
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add item to cart.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleProceedToCheckout = () => {
    setIsProceedingToCheckout(true);
    navigate(`/checkout?id=${listing.id}&type=declutter`);
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle>Buy in Bulk</CardTitle>
        <CardDescription>
          {listing.is_negotiable ? "Price is negotiable" : "Fixed bulk price"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="quantity" className="text-sm font-medium">
                Quantity
              </label>
              <Input
                id="quantity"
                type="number"
                className="w-24"
                value={quantity}
                onChange={handleQuantityInput}
                min={listing.min_purchase_quantity}
                max={listing.quantity}
              />
              <p className="text-xs text-muted-foreground">
                Min: {listing.min_purchase_quantity}, Max: {listing.quantity}
              </p>
            </div>
            
            <div className="flex-1">
              <div className="p-3 bg-secondary/40 rounded-md">
                <div className="flex justify-between text-sm mb-1">
                  <span>Price per unit:</span>
                  <span>${formatCurrency(listing.bulk_price)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quantity:</span>
                  <span>{quantity} items</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              className="flex-1"
              onClick={handleProceedToCheckout}
              disabled={isProceedingToCheckout}
            >
              {isProceedingToCheckout ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Buy Now
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {listing.is_negotiable && (
          <MessageContactSellerDialog 
            open={isContactDialogOpen}
            onOpenChange={setIsContactDialogOpen}
            sellerName={listing.seller_name || "Seller"}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default DeclutterPurchaseCard;
