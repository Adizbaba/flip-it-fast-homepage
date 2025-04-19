import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type OrderSummaryProps } from "./schemas";

const OrderSummary = ({ item }: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-20 h-20 object-cover rounded-md"
            />
          ) : (
            <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.type === "listing" 
                ? "Listing Fee" 
                : item.type === "bid" 
                  ? "Bid Payment" 
                  : "Purchase Payment"}
            </p>
          </div>
          
          <div className="text-right">
            <p className="font-medium">${item.amount.toFixed(2)}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${item.amount.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
