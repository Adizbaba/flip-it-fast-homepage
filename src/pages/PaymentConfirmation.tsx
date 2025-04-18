
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const PaymentConfirmation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get reference from URL query params
    const reference = searchParams.get("reference");
    
    if (!reference) {
      setVerifying(false);
      setSuccess(false);
      toast({
        variant: "destructive",
        title: "Invalid payment confirmation",
        description: "Missing payment reference",
      });
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { reference },
        });

        if (error) throw error;
        
        setSuccess(data.success);
        setPaymentDetails(data.data);

        toast({
          title: data.success ? "Payment Successful" : "Payment Failed",
          description: data.success 
            ? "Your transaction has been processed successfully" 
            : "There was an issue with your payment",
          variant: data.success ? "default" : "destructive",
        });
      } catch (error) {
        console.error("Verification error:", error);
        setSuccess(false);
        toast({
          variant: "destructive",
          title: "Verification Error",
          description: "Failed to verify your payment status",
        });
      } finally {
        setVerifying(false);
      }
    };

    if (reference) {
      verifyPayment();
    }
  }, [searchParams, toast]);

  const renderContent = () => {
    if (verifying) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we verify your payment.</p>
        </div>
      );
    }

    if (success === true) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 p-12">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-semibold">Payment Successful!</h2>
          <p className="text-center text-muted-foreground max-w-md">
            Your transaction has been completed successfully. Thank you for your payment.
          </p>
          
          {paymentDetails?.metadata?.paymentType === "listing" && (
            <div className="bg-green-50 p-4 rounded-lg max-w-md">
              <p className="text-green-700 text-center">
                Your listing is now active and visible to potential buyers.
              </p>
            </div>
          )}

          <div className="flex space-x-4 mt-6">
            <Button onClick={() => navigate("/")}>
              Return Home
            </Button>
            {user && (
              <Button variant="outline" onClick={() => navigate("/watch-list")}>
                View My Items
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-12">
        <XCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-semibold">Payment Failed</h2>
        <p className="text-center text-muted-foreground max-w-md">
          We couldn't complete your payment. Please try again or contact support if the problem persists.
        </p>
        <div className="flex space-x-4 mt-6">
          <Button onClick={() => window.history.back()}>
            Try Again
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl bg-card rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentConfirmation;
