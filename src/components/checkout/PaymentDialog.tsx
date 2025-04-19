import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type PaymentDialogProps } from "./schemas";

const PaymentDialog = ({ open, onOpenChange, paymentUrl, onCancel }: PaymentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="mb-4">Continue to the Paystack payment page to complete your transaction.</p>
          
          <div className="flex space-x-4 justify-end">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={() => paymentUrl && window.location.assign(paymentUrl)}>
              Continue to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
