
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, Package, User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface AuctionData {
  id: string;
  title: string;
  description: string;
  final_selling_price: number;
  images: string[];
  seller_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

const AuctionPayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const auctionId = searchParams.get("auctionId");
  
  const [auction, setAuction] = useState<AuctionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user || !auctionId) {
      navigate("/");
      return;
    }

    const fetchAuctionDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("auction_items")
          .select(`
            *,
            profiles:seller_id(username, avatar_url)
          `)
          .eq("id", auctionId)
          .eq("winner_id", user.id)
          .eq("status", "Ended")
          .single();

        if (error || !data) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You don't have permission to pay for this auction.",
          });
          navigate("/");
          return;
        }

        // Check if payment already completed
        const { data: paymentData } = await supabase
          .from("payment_transactions")
          .select("*")
          .eq("item_id", auctionId)
          .eq("user_id", user.id)
          .eq("status", "completed")
          .single();

        if (paymentData) {
          toast({
            title: "Already Paid",
            description: "You have already paid for this auction.",
          });
          navigate("/dashboard/orders");
          return;
        }

        setAuction(data);
      } catch (error) {
        console.error("Error fetching auction:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load auction details.",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [user, auctionId, navigate, toast]);

  const handlePayment = async () => {
    if (!auction || !user) return;

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-auction-payment", {
        body: { auctionId: auction.id },
      });

      if (error) throw error;

      if (data.success) {
        // Redirect to Paystack
        window.location.href = data.data.authorization_url;
      } else {
        throw new Error(data.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to initialize payment. Please try again.",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading auction details...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const mainImage = Array.isArray(auction.images) && auction.images.length > 0 
    ? auction.images[0] 
    : "/placeholder.svg";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground">
              Congratulations! You won this auction. Complete your payment to secure your item.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={mainImage}
                    alt={auction.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{auction.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {auction.description}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>Winning Bid</span>
                  <span className="font-semibold">₦{auction.final_selling_price.toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold">₦0</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₦{auction.final_selling_price.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Seller:</span>
                  </div>
                  <span className="text-sm">{auction.profiles?.username || "Unknown"}</span>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Paystack to complete your payment securely.
                  </p>
                  
                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ₦{auction.final_selling_price.toLocaleString()}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    By proceeding, you agree to complete this purchase. 
                    Payment is processed securely through Paystack.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AuctionPayment;
