
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentSectionProps {
  amount: number;
  processing: boolean;
  onPaymentClick: () => void;
}

const PaymentSection = ({ amount, processing, onPaymentClick }: PaymentSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Click the button below to proceed with Paystack secure payment.
        </p>
        
        <Button 
          onClick={onPaymentClick}
          disabled={processing}
          className="w-full"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing
            </>
          ) : (
            <>Pay ${amount.toFixed(2)}</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentSection;
