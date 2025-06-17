
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface CheckoutSidebarProps {
  items: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

const CheckoutSidebar = ({ items, subtotal, shippingCost, total }: CheckoutSidebarProps) => {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <Badge 
                  className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs"
                  variant="secondary"
                >
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {item.itemType === "auction" ? "Auction Item" : "Declutter Item"}
                </p>
              </div>
              <p className="text-sm font-medium">
                ₦{(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Shipping:</span>
            <span>
              {shippingCost === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                `₦${shippingCost.toLocaleString()}`
              )}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>₦{total.toLocaleString()}</span>
        </div>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Secure checkout with SSL encryption</p>
          <p>💳 We accept all major cards via Paystack</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutSidebar;
