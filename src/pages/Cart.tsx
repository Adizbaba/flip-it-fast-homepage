import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash, Minus, Plus, ArrowRight, ShoppingCart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

const Cart = () => {
  const { user } = useAuth();
  const { 
    items, 
    isLoading, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal,
    totalItems
  } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  // Calculate estimated shipping (could be enhanced with real shipping API)
  const estimatedShipping = subtotal > 50 ? 0 : 9.99;
  const grandTotal = subtotal + estimatedShipping;

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/auth");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Navigate to the new step-by-step checkout flow
    navigate("/checkout-flow");
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast.error("Minimum quantity is 1");
      return;
    }
    if (newQuantity > 99) {
      toast.error("Maximum quantity is 99");
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="flex items-center justify-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent text-auction-purple"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          {items.length > 0 && (
            <p className="text-muted-foreground mt-1">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in your cart
            </p>
          )}
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-12 md:py-16">
            <div className="max-w-md mx-auto">
              <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-xl md:text-2xl font-medium mb-2">Your cart is empty!</h2>
              <p className="text-muted-foreground mb-6">
                Discover amazing deals and unique items. Start adding products to your cart.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/auctions")} className="flex-1 sm:flex-none">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Auctions
                </Button>
                <Button variant="outline" onClick={() => navigate("/declutter")} className="flex-1 sm:flex-none">
                  Browse Declutter Items
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Items in Cart</h2>
                {items.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to clear your entire cart?")) {
                        clearCart();
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => navigate(`/item/${item.itemId}`)}
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h3 
                                  className="font-medium mb-1 cursor-pointer hover:text-primary transition-colors line-clamp-2"
                                  onClick={() => navigate(`/item/${item.itemId}`)}
                                >
                                  {item.title}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.itemType === "auction" ? "Auction Item" : "Declutter Item"}
                                  </Badge>
                                </div>
                                <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
                                <p className="text-sm text-muted-foreground">
                                  Total: ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  if (window.confirm("Remove this item from cart?")) {
                                    removeFromCart(item.id);
                                  }
                                }}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">Qty:</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= 99}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="lg:sticky lg:top-24 h-fit">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''}):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Shipping:</span>
                      <span>
                        {estimatedShipping === 0 ? (
                          <span className="text-green-600 font-medium">FREE</span>
                        ) : (
                          `$${estimatedShipping.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {estimatedShipping === 0 && (
                      <p className="text-xs text-green-600">Free shipping on orders over $50</p>
                    )}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={processing || items.length === 0}
                  >
                    {processing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Secure Checkout <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => navigate("/auctions")}
                  >
                    Continue Shopping
                  </Button>
                  
                  <div className="mt-4 text-xs text-muted-foreground text-center">
                    <p>🔒 Secure checkout with SSL encryption</p>
                    <p>💳 We accept all major credit cards</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
