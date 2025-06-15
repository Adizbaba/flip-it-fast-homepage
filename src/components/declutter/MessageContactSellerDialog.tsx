
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MessageContactSellerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sellerName: string;
}

export function MessageContactSellerDialog({
  open,
  onOpenChange,
  sellerName,
}: MessageContactSellerDialogProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSendMessage = () => {
    // Simplified - would be implemented with a real messaging system
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the seller.",
    });
    onOpenChange(false);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full">
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Seller for Custom Quote
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact the Seller</DialogTitle>
          <DialogDescription>
            Send a message to {sellerName} about this listing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Message
            </label>
            <Input
              id="message"
              placeholder="I'm interested in your listing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendMessage}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
