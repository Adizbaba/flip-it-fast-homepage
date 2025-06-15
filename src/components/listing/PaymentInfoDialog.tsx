
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingItem: {
    title: string;
    fee: number;
    startingBid: number;
  } | null;
  onSkip: () => void;
  onProceed: () => void;
}

export const PaymentInfoDialog = ({
  open,
  onOpenChange,
  listingItem,
  onSkip,
  onProceed
}: PaymentInfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Listing Fee</DialogTitle>
          <DialogDescription>
            Pay the listing fee to publish your item immediately
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {listingItem && (
            <>
              <p><strong>Item:</strong> {listingItem.title}</p>
              <p className="mt-2"><strong>Listing Fee:</strong> ${listingItem.fee.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">
                (5% of your starting bid of ${listingItem.startingBid}, minimum $5)
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSkip}>Save as Draft</Button>
          <Button onClick={onProceed}>Pay Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
