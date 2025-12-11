import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CartErrorProps {
  message?: string;
  onRetry?: () => void;
}

const CartError = ({ 
  message = "Something went wrong loading your cart", 
  onRetry 
}: CartErrorProps) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CartError;