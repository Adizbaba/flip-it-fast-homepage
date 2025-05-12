
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingItem: {
    title: string;
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
          <DialogTitle>Listing Confirmation</DialogTitle>
          <DialogDescription>
            Confirm your listing details before publishing
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {listingItem && (
            <>
              <p><strong>Item:</strong> {listingItem.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your listing will be published immediately
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSkip}>Save as Draft</Button>
          <Button onClick={onProceed}>Publish Now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
