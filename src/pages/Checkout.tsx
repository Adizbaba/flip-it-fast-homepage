
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import CheckoutLoading from "@/components/checkout/CheckoutLoading";
import CheckoutError from "@/components/checkout/CheckoutError";
import PaymentDialog from "@/components/checkout/PaymentDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PAYMENT_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  itemType: string;
};

type OrderDetail = {
  id: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

const Checkout = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentTimeout, setPaymentTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get("id");
    
    if (!orderId) {
      toast({
        variant: "destructive",
        title: "Invalid checkout request",
        description: "Missing order ID. Please try again.",
      });
      navigate("/cart");
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (orderError) throw orderError;
        
        // Ensure user owns this order
        if (orderData.user_id !== user?.id) {
          throw new Error("You don't have permission to access this order");
        }

        // Fetch order items
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId);

        if (itemsError) throw itemsError;
        
        // Transform data for display
        const items = orderItems.map(item => ({
          id: item.id,
          title: item.item_data?.title || "Unknown item",
          price: item.price,
          quantity: item.quantity,
          image: item.item_data?.image,
          itemType: item.item_type
        }));

        setOrder({
          id: orderData.id,
          totalAmount: orderData.total_amount,
          status: orderData.status,
          items
        });
      } catch (error: any) {
        console.error("Error fetching order:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load order details. Please try again.",
        });
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [location, navigate, toast, user]);

  const handlePayment = async () => {
    if (!user || !order) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to complete your purchase.",
      });
      navigate("/auth");
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          amount: order.totalAmount,
          email: user.email,
          userId: user.id,
          itemId: order.id,
          paymentType: "purchase",
          metadata: {
            orderId: order.id
          }
        },
      });

      if (error) throw error;
      
      if (data.status && data.data && data.data.authorization_url) {
        setPaymentUrl(data.data.authorization_url);
        setDialogOpen(true);
        
        // Set payment timeout
        const timeout = setTimeout(() => {
          setDialogOpen(false);
          setPaymentUrl(null);
          toast({
            variant: "destructive",
            title: "Payment Timeout",
            description: "The payment session has expired. Please try again.",
          });
        }, PAYMENT_TIMEOUT);
        
        setPaymentTimeout(timeout);
      } else {
        throw new Error("Invalid payment response. Please try again.");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPaymentUrl(null);
    if (paymentTimeout) {
      clearTimeout(paymentTimeout);
      setPaymentTimeout(null);
    }
  };

  // Handle post-payment confirmation
  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      const searchParams = new URLSearchParams(location.search);
      const reference = searchParams.get("reference");
      const success = searchParams.get("success");
      
      if (reference && success === "true") {
        try {
          // Call Verify Payment function
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { reference },
          });

          if (error) throw error;
          
          if (data.success) {
            toast({
              title: "Payment Successful",
              description: "Your order has been completed successfully.",
            });
            
            // Clear cart after successful payment
            await clearCart();
            
            // Navigate to order confirmation
            navigate(`/payment-confirmation?reference=${reference}`);
          } else {
            toast({
              variant: "destructive",
              title: "Payment Verification Failed",
              description: "We couldn't verify your payment. Please contact support.",
            });
          }
        } catch (error) {
          console.error("Verification error:", error);
          toast({
            variant: "destructive",
            title: "Verification Error",
            description: "An error occurred while verifying your payment.",
          });
        }
      }
    };
    
    handlePaymentConfirmation();
  }, [location, navigate, toast, clearCart]);

  useEffect(() => {
    return () => {
      if (paymentTimeout) {
        clearTimeout(paymentTimeout);
      }
    };
  }, [paymentTimeout]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <CheckoutLoading />
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <CheckoutError />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center py-2">
                      <div className="h-16 w-16 mr-4">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.itemType === "auction" ? "Auction Item" : "Declutter Item"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click the button below to complete your payment using Paystack secure payment.
                  </p>
                  
                  <Button 
                    onClick={handlePayment}
                    disabled={processing || order.status !== "pending"}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                        Processing
                      </>
                    ) : (
                      <>Pay ${order.totalAmount.toFixed(2)}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paymentUrl={paymentUrl}
        onCancel={handleDialogClose}
      />

      <Footer />
    </div>
  );
};

export default Checkout;
