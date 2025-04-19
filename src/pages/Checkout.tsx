import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import CheckoutLoading from "@/components/checkout/CheckoutLoading";
import CheckoutError from "@/components/checkout/CheckoutError";
import OrderSummary from "@/components/checkout/OrderSummary";
import PaymentSection from "@/components/checkout/PaymentSection";
import PaymentDialog from "@/components/checkout/PaymentDialog";
import { type CheckoutItem } from "@/components/checkout/schemas";

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
          <CheckoutLoading />
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
              <OrderSummary item={item} />
            </div>
            
            <div>
              <PaymentSection
                amount={item.amount}
                processing={processing}
                onPaymentClick={handlePayment}
              />
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
