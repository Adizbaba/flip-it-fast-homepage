
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash, Minus, Plus, ArrowRight, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

    try {
      setProcessing(true);

      // Calculate total amount
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity, 
        0
      );

      // Create order with status "pending"
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: "pending"
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        item_id: item.itemId,
        item_type: item.itemType,
        quantity: item.quantity,
        price: item.price,
        item_data: {
          title: item.title,
          image: item.image,
          price: item.price
        }
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Navigate to checkout page with the order ID
      navigate(`/checkout?id=${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to process checkout");
      setProcessing(false);
    }
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
      <main className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={() => navigate("/auctions")}>
              Browse Auctions
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-32 h-32">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.itemType === "auction" ? "Auction Item" : "Declutter Item"}
                            </p>
                            <p className="font-semibold">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {items.length > 0 && (
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => clearCart()}
                  >
                    Clear Cart
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Items ({totalItems}):</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${subtotal.toFixed(2)}</span>
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
                        Processing
                      </>
                    ) : (
                      <>
                        Checkout <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
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
