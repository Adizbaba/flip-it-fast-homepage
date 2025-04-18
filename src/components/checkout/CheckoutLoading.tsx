
import { Loader2 } from "lucide-react";

const CheckoutLoading = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading checkout...</p>
    </div>
  );
};

export default CheckoutLoading;
