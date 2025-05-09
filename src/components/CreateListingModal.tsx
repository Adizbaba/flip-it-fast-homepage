
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Gavel, BoxIcon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CreateListingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListingModal({ open, onOpenChange }: CreateListingModalProps) {
  const navigate = useNavigate();

  const handleNormalListing = () => {
    navigate("/listing/create");
    onOpenChange(false);
    toast.success("Creating a new auction listing");
  };

  const handleDeclutterListing = () => {
    navigate("/declutter/create");
    onOpenChange(false);
    toast.success("Creating a new declutter listing");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-4">Choose Listing Type</DialogTitle>
          <DialogDescription className="text-center">
            Select the type of listing you want to create
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div 
            onClick={handleNormalListing}
            className="flex flex-col items-center p-6 border rounded-lg hover:border-auction-purple hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <Gavel className="h-16 w-16 mb-4 text-auction-purple" />
            <h3 className="font-semibold text-lg mb-2">Normal Auction</h3>
            <p className="text-sm text-gray-500 text-center">Create a traditional auction listing</p>
            <Button 
              variant="ghost" 
              className="mt-4 flex items-center gap-1 text-auction-purple hover:bg-purple-100"
            >
              Select <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div 
            onClick={handleDeclutterListing}
            className="flex flex-col items-center p-6 border rounded-lg hover:border-auction-purple hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            <BoxIcon className="h-16 w-16 mb-4 text-auction-purple" />
            <h3 className="font-semibold text-lg mb-2">Declutter Listing</h3>
            <p className="text-sm text-gray-500 text-center">Quick listing for items you want to sell fast</p>
            <Button 
              variant="ghost" 
              className="mt-4 flex items-center gap-1 text-auction-purple hover:bg-purple-100"
            >
              Select <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to open the modal
export const createListingModal = () => {
  const [isOpen, setIsOpen] = useState(true);
  
  const element = document.createElement("div");
  document.body.appendChild(element);
  
  const cleanup = () => {
    setTimeout(() => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, 300); // Small delay to allow for exit animations
  };
  
  import('react-dom/client').then((ReactDOMClient) => {
    const root = ReactDOMClient.createRoot(element);
    root.render(
      <CreateListingModal open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) cleanup();
      }} />
    );
  }).catch(err => {
    console.error("Failed to load react-dom/client:", err);
    document.body.removeChild(element);
  });
};
