
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutItem {
  id: string;
  title: string;
  image?: string;
  amount: number;
  type: "bid" | "listing" | "purchase";
}

const Checkout = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState<CheckoutItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const itemId = searchParams.get("id");
    const itemType = searchParams.get("type");
    
    if (!itemId || !itemType) {
      toast({
        variant: "destructive",
        title: "Invalid checkout request",
        description: "Missing required parameters",
      });
      navigate("/");
      return;
    }

    // Fetch item details based on type
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        let result;

        if (itemType === "listing") {
          const { data, error } = await supabase
            .from("auction_items")
            .select("id, title, images, starting_bid")
            .eq("id", itemId)
            .single();

          if (error) throw error;

          // Listing fee is a fixed amount or percentage of starting bid
          const listingFee = Math.max(5, data.starting_bid * 0.05);
          
          result = {
            id: data.id,
            title: data.title,
            image: data.images?.[0],
            amount: listingFee,
            type: "listing" as const,
          };
        } else if (itemType === "bid" || itemType === "purchase") {
          const { data, error } = await supabase
            .from("auction_items")
            .select("id, title, images, starting_bid, buy_now_price")
            .eq("id", itemId)
            .single();

          if (error) throw error;
          
          result = {
            id: data.id,
            title: data.title,
            image: data.images?.[0],
            amount: itemType === "purchase" ? data.buy_now_price : data.starting_bid,
            type: itemType as "bid" | "purchase",
          };
        } else {
          throw new Error("Invalid item type");
        }

        setItem(result);
      } catch (error) {
        console.error("Error fetching item:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load checkout item",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [location, navigate, toast]);

  const handlePayment = async () => {
    if (!user || !item) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be signed in to complete this transaction",
      });
      navigate("/auth");
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          amount: item.amount,
          email: user.email,
          userId: user.id,
          itemId: item.id,
          paymentType: item.type,
          metadata: {
            itemTitle: item.title
          }
        },
      });

      if (error) throw error;
      
      if (data.status && data.data && data.data.authorization_url) {
        setPaymentUrl(data.data.authorization_url);
        setDialogOpen(true);
      } else {
        throw new Error("Invalid payment response");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPaymentUrl(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-lg font-medium">Item not found</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
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
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.type === "listing" 
                          ? "Listing Fee" 
                          : item.type === "bid" 
                            ? "Bid Payment" 
                            : "Purchase Payment"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">${item.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${item.amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Click the button below to proceed with Paystack secure payment.
                  </p>
                  
                  <Button 
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing
                      </>
                    ) : (
                      <>Pay ${item.amount.toFixed(2)}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Payment</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="mb-4">Continue to the Paystack payment page to complete your transaction.</p>
            
            <div className="flex space-x-4 justify-end">
              <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
              <Button onClick={() => paymentUrl && window.location.assign(paymentUrl)}>
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Checkout;
